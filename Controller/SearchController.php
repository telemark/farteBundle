<?php
/**
 * File containing the SearchController class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */

namespace tfk\farteBundle\Controller;

use eZ\Bundle\EzPublishCoreBundle\Controller;
//use EzSystems\DemoBundle\Entity\SimpleSearch;
//use EzSystems\DemoBundle\Helper\SearchHelper;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use eZ\Publish\API\Repository\Values\Content\Query;
use eZ\Publish\API\Repository\Values\Content\Query\Criterion;
use eZ\Publish\Core\Pagination\Pagerfanta\ContentSearchAdapter;
use Pagerfanta\Pagerfanta;


class SearchController extends Controller
{

    /**
     * Displays the search box for the page header
     *
     * @return Response HTML code of the page
     */
    public function searchBoxAction()
    {
        $response = new Response();

        /** @var SearchAdapter $searchAdapter */
        $searchAdapter = $this->get('netgen_search_and_filter.route_');
        /** @var Form $form */
        $form = $searchAdapter->getForm();

        return $this->render(
            'tfkfarteBundle::page_header_searchbox.html.twig',
            array(
                'form_template' => $searchAdapter->getFormTemplate(),
                'form' => $form->createView()
            ),
            $response
        );
    }

    public function searchAction()
    {
        // defaults
        $contentOffset = 0;
        $sortQuery = array('score' => 'desc');
        $searchString = null;
        //$layout = $configResolver->getParameter( 'content_view.viewbase_layout', 'ezpublish' );

        $configResolver = $this->getConfigResolver();
        $rootLocation = $this->getRootLocation();

        if ( $configResolver->hasParameter( 'content.identifiers', 'search' ) )
            $identifiers = $configResolver->getParameter( 'content.identifiers', 'search' );

        if ( $configResolver->hasParameter( 'content.limit', 'search' ) )
            $contentLimit = $configResolver->getParameter( 'content.limit', 'search' );

        if ( $configResolver->hasParameter( 'content.facets', 'search' ) )
            $validContentFacets = $configResolver->getParameter( 'content.facets', 'search' );

        $request = Request::createFromGlobals();

        $scriptUri              = $request->server->get('SCRIPT_URI');
        $searchString           = $request->query->get('SearchText');  
        $queryString            = $request->server->get('QUERY_STRING'); 
        //if ( $request->query->get('offset') !== null )
        $contentOffset          = intval( $request->query->get('offset') );
        $filterParameters       = $request->query->get('filter');
        $activeFacetParameters  = $request->query->get('activeFacets');
        $dateFilter             = $request->query->get('dateFilter');
        $sort                   = $request->query->get('sort');

        $queryUri = $scriptUri.'?'.$queryString;
        $searchUri = $scriptUri.'?SearchText='.$searchString;

        $response = new Response();

        $renderArray = array(
            'noLayout'          => true,
            'searchString'      => $searchString,
            'script_uri'        => $scriptUri,
            'search_uri'        => $searchUri,
            'query_string'      => $queryString,
            'query_uri'         => $queryUri,
            'filterParameters'  => $filterParameters,
            'activeFacetParameters'      => $activeFacetParameters,
            'dateFilter'        => $dateFilter,
            'sort'              => $sort
        );

        switch ( $sort ) 
        {
            case 'alpha':
                $sortQuery = array('name' => 'asc');
                break;
            
            case 'score':
                $sortQuery = array('score' => 'desc');
                break;

            case 'newest':
                $sortQuery = array('published' => 'desc');
                break;

            case 'oldest':
                $sortQuery = array('published' => 'asc');
                break;

            default:
                $sortQuery = array('score' => 'desc');
                $sort = 'score';
                break;
        }

        $contentResult = array();

        if ( $searchString )
        {
            // Using ezfind legacy to build filterParameters
            $filterParameters = $this->getLegacyKernel()->runCallback(
                function ()
                {
                    return \eZFunctionHandler::execute(
                        'ezfind',
                        'filterParameters'
                    );
                }
            );

            // Using ezfind legacy to build defaultSearchFacets
            $defaultSearchFacets = $this->getLegacyKernel()->runCallback(
                function ()
                {
                    return \eZFunctionHandler::execute(
                        'ezfind',
                        'getDefaultSearchFacets'
                    );
                }
            );

            $contentResult = $this->getLegacyKernel()->runCallback(
                function () use ( $searchString, $identifiers, $contentLimit, $contentOffset, $rootLocation, $defaultSearchFacets, $filterParameters, $dateFilter, $sortQuery )
                {
                    return \eZFunctionHandler::execute(
                        'ezfind', 'search',
                        array(
                            'query'         => $searchString,
                            'subtree_array' => array( $rootLocation->id ),
                            'class_id'      => $identifiers,    
                            'limit'         => $contentLimit,
                            'offset'        => $contentOffset,
                            'sort_by'       => $sortQuery,
                            'publish_date'  => $dateFilter,
                            'facet'         => $defaultSearchFacets,
                            'filter'        => $filterParameters
                        )
                    );
                }
            );

            $searchExtras = $contentResult['SearchExtras'];

            // Build facet and filter arrays for facets 
            $facet_fields = $searchExtras->attribute('facet_fields');
            $facet_dates = $searchExtras->attribute('facet_dates');
            $facet_ranges = $searchExtras->attribute('facet_ranges');
            $activeFacetsArray = array();
            $availableFacetsArray = array();



            $uriSuffix = '';

            foreach ( $activeFacetParameters as $facetField => $facetValue )
                $uriSuffix .= "&activeFacets[" . $facetField . "]=" . $facetValue;

            foreach ( $filterParameters as $name => $value )
                $uriSuffix .= "&filter[]=" . $name . ":" . $value;

            if ( $dateFilter > 0 )
                $uriSuffix .= "&dateFilter=".$dateFilter;

            if ( $sort )
                $uriSuffix .= "&sort=".$sort;

            // sort links
            $sorting = array();
            $sortTypes = array('alpha', 'score', 'newest', 'oldest');
            $sortingRemoved = str_replace( '&sort='.$sort, '', $searchUri.$uriSuffix);
            foreach ( $sortTypes as $sortType ) 
            {
                $sorting[$sortType] = $sortingRemoved.'&sort='.$sortType;
            }

            // removal links
            foreach ($defaultSearchFacets as $key => $defaultFacet)
            { 
                // only use facets which is selected in config
                if ( in_array( $defaultFacet['field'], $validContentFacets) || in_array( $key, $validContentFacets) )
                {
                    if ( $defaultFacet['field'] and $defaultFacet['name'] )
                    {
                        if ( array_key_exists( $defaultFacet['field'] . ':' . $defaultFacet['name'] , $activeFacetParameters ) )
                        {
                            $facetData = $facet_fields[$key];
                            foreach ($facetData['nameList'] as $key2 => $facetName)
                            {
                                if ($activeFacetParameters[ $defaultFacet['field'] . ':' . $defaultFacet['name'] ] == $facetName )
                                {
                                    $removalFilter = '&filter[]=' . $facetData['fieldList'][$key2] . ':' . $key2;
                                    $facetRemovalUrl = str_replace( $removalFilter, '', $searchUri.$uriSuffix);
                                    $removalFacet = "&activeFacets[" . $defaultFacet['field'] . ":" . $defaultFacet['name'] . "]=" . $facetName;
                                    $facetRemovalUrl = str_replace( $removalFacet, '', $facetRemovalUrl);
                                    $activeFacetsArray[] = array(
                                        'text' => $facetName,
                                        'url' => $facetRemovalUrl
                                    );
                                }
                            } 
                        }
                    }
                }
            }
            
            // possible 
            foreach ( $defaultSearchFacets as $key => $defaultFacet )
            { 
                // only use facets which is selected
                if ( in_array( $defaultFacet['field'], $validContentFacets) || in_array( $key, $validContentFacets) )
                {
                    if ( !array_key_exists( $defaultFacet['field'] . ':' . $defaultFacet['name'], $activeFacetParameters ) )
                    {
                        $facetData = $facet_fields[$key];
                        $availableFacetsSubArray = array();
                        foreach ( $facetData['nameList'] as $key2 => $facetName )
                        {
                            if ( $key2 != '' )
                            {
                                $url = $searchUri . '&filter[]=' . $facetData['fieldList'][$key2]. ':'. $key2 . '&activeFacets['. $defaultFacet['field'] . ':' . rawurlencode($defaultFacet['name']) . ']=' . rawurlencode($facetName) . $uriSuffix;
                                $availableFacetsSubArray[] = array(
                                    'text'  => $facetName,
                                    'count' => $facetData['countList'][$key2],
                                    'url'   => $url
                                );
                            }
                        }
                        if ( $facetData['field'] != '' && count($availableFacetsSubArray) > 0 )
                        {
                            $heading = $defaultFacet['name'];
                            switch ($defaultFacet['name']) {
                                //case 'Content type':
                                //    $heading = 'Innholdstype';
                                //    break;
                                case 'Kategorier':
                                    $heading = 'Innholdstype';
                                    break;
                                case 'Author':
                                    $heading = 'Forfatter';
                                    break;
                                //case 'Keywords':
                                //    $heading = 'Nøkkelord';
                                //    break;
                                case 'Tags':
                                    $heading = 'Nøkkelord';
                                    break;
                                
                            }
                            $availableFacetsArray[] = array( 
                                'field' => $defaultFacet['field'], 
                                'name' => $defaultFacet['name'],
                                'heading' => $heading,
                                'fieldSet' => $availableFacetsSubArray
                            );

                        }
                    }
                }
            }

            // dateFilter labels
            $dateFilterTexts = array(
                1 => 'Siste døgn',
                2 => 'Siste uke',
                3 => 'Siste måned',
                4 => 'Siste 3 måneder',
                5 => 'Siste år'
            );

            if ( in_array('date', $validContentFacets) )
            {
                if ( !$dateFilter )
                {
                    $availableDateFilters = array();
                    foreach ( $dateFilterTexts as $key => $value)
                        $availableDateFilters[] = array( 'url' => $searchUri.$uriSuffix.'&dateFilter='.$key, 'text' => $value);
                }
                else
                {
                    $availableDateFilters = false;
                    $activeDateFilters = array();
                    $removalFilter = '&dateFilter=' . $dateFilter;
                    $dateRemovalUrl = str_replace( $removalFilter, '', $searchUri.$uriSuffix);
                    $activeDateFilters[] = array(
                        'text' => $dateFilterTexts[$dateFilter],
                        'url' => $dateRemovalUrl
                    );
                }
            }

            // pagination
            $contentPage = $contentOffset / $contentLimit + 1;
            $contentPages = intval( $contentResult['SearchCount'] / $contentLimit );
            if ( $contentResult['SearchCount'] / $contentLimit > $contentPages )
                $contentPages++;
            
            $prevPageUrl = '';
            $nextPageUrl = '';

            if ( $contentPage > 1 )
            {
                $prevPageOffset = $contentOffset - $contentLimit;
                $prevPageUrl = $searchUri.$uriSuffix.'&offset='.$prevPageOffset;
            }
            if ( $contentOffset + $contentLimit < $contentResult['SearchCount'] ) 
            {
                $nextPageOffset = $contentOffset + $contentLimit;
                $nextPageUrl = $searchUri.$uriSuffix.'&offset='.$nextPageOffset;
            }

            $searchResult = array(
                'contentResult'         => $contentResult['SearchResult'],
                'contentCount'          => $contentResult['SearchCount'],
                'contentOffset'         => $contentOffset,
                'contentPage'           => $contentPage,
                'contentPages'          => $contentPages,
                'prevPageUrl'           => $prevPageUrl,
                'nextPageUrl'           => $nextPageUrl,
                'sort'                  => $sort,
                'sorting'               => $sorting,
                'defaultSearchFacets'   => $defaultSearchFacets,
                'filterParameters'      => $filterParameters,
                'activeFacets'          => $activeFacets,
                'engine'                => $searchExtras->attribute('engine'),
                'facet_fields'          => $searchExtras->attribute('facet_fields'),
                'facet_dates'           => $searchExtras->attribute('facet_dates'),
                'facet_ranges'          => $searchExtras->attribute('facet_ranges'),
                'searchExtras'          => $searchExtras,
                'activeFacetsArray'     => $activeFacetsArray,
                'availableFacetsArray'  => $availableFacetsArray,
                'activeDateFilters'     => $activeDateFilters,
                'availableDateFilters'  => $availableDateFilters
            );

            $renderArray = array_merge( $renderArray, $searchResult);
        }


        return $this->render(
            'tfkfarteBundle:search:searchresult.html.twig',
            $renderArray,
            $response
        );
    }
}
