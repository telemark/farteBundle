<?php
/**
 * This file is part of the DemoBundle package
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributd with this source code.
 * @version //autogentag//
 */
namespace tfk\farteBundle\Controller;

use eZ\Bundle\EzPublishCoreBundle\Controller;

use eZ\Publish\API\Repository\Values\Content\LocationQuery;
use eZ\Publish\API\Repository\Values\Content\Query;
use eZ\Publish\API\Repository\Values\Content\Query\Criterion\ParentLocationId;
use eZ\Publish\API\Repository\Values\Content\Query\Criterion;
use eZ\Publish\API\Repository\Values\Content\Query\SortClause;
use eZ\Publish\Core\Pagination\Pagerfanta\ContentSearchAdapter;
use eZ\Publish\API\Repository\Values\Content\Location;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;

use tfk\farteBundle\Helper\SortLocationHelper;

class MenuController extends Controller
{
    /**
     * @param mixed|null $currentLocationId
     * @return Response
     */
	  public function leftMenuAction( $currentLocationId )
    {
        /*if ( $currentLocationId !== null )
        {
            $location = $this->getLocationService()->loadLocation( $currentLocationId );
            if ( isset( $location->path[2] ) )
            {
                var_dump($location->path[2]);
                $secondLevelLocationId = $location->path[2];
            }
        }
        */

        $response = new Response;

        $menu = $this->getMenu( 'top' );
        $menu->setChildrenAttribute('class', 'nav side-menu');
        $parameters = array( 'menu' => $menu );

        /*if ( isset( $secondLevelLocationId ) && isset( $menu[$secondLevelLocationId] ) )
        {
            $parameters['submenu'] = $menu[$secondLevelLocationId];
        }*/

        return $this->render( 'tfkfarteBundle::page_leftmenu.html.twig', $parameters, $response );
    }
	
    public function topMenuAction( $currentLocationId )
    {
        if ( $currentLocationId !== null )
        {
            $location = $this->getLocationService()->loadLocation( $currentLocationId );
            if ( isset( $location->path[2] ) )
            {
                $secondLevelLocationId = $location->path[2];
            }
        }

        $response = new Response;

        $menu = $this->getMenu( 'top' );
        $parameters = array( 'menu' => $menu );

        if ( isset( $secondLevelLocationId ) && isset( $menu[$secondLevelLocationId] ) )
        {
            $parameters['submenu'] = $menu[$secondLevelLocationId];
        }

        return $this->render( 'tfkfarteBundle::page_topmenu.html.twig', $parameters, $response );
    }

    /**
     * @param string $identifier
     * @return \Knp\Menu\MenuItem
     */
    private function getMenu( $identifier )
    {
        return $this->container->get( "telemark.menu.$identifier" );
    }

    /**
     * @return \eZ\Publish\API\Repository\LocationService
     */
    private function getLocationService()
    {
        return $this->container->get( 'ezpublish.api.service.location' );
    }
    public function mainMenuAction()
    {
        $rootLocation = $this->getRootLocation();
        $configResolver = $this->getConfigResolver();
        $repository = $this->getRepository();
        $locationService = $repository->getLocationService();
        $searchService = $repository->getSearchService();

        $identifiers = array( 'folder' );
        $items = array();

        $query = new LocationQuery();

        $otherIdentifiers = array();
        foreach ( $identifiers as $identifier )
        {
            if ( $identifier != 'folder' )
                $otherIdentifiers[] = $identifier;
        }

        if ( in_array( 'folder', $identifiers ) )
        {
            $arr1Criteria[] = new Criterion\ParentLocationId( $rootLocation->id );
            $arr1Criteria[] = new Criterion\ContentTypeIdentifier( array( 'folder' ) );
            $arr1Criteria[] = new Criterion\Visibility( Criterion\Visibility::VISIBLE );
            $arr1Criteria[] = new Criterion\Field( "hide_from_menu", Criterion\Operator::EQ, false );

            $arrCriteria[]  = new Criterion\LogicalAnd($arr1Criteria);
        }

        if ( $otherIdentifiers )
        {
            $arr2Criteria[] = new Criterion\ParentLocationId( $rootLocation->id );
            $arr2Criteria[] = new Criterion\ContentTypeIdentifier( $otherIdentifiers );
            $arr2Criteria[] = new Criterion\Visibility( Criterion\Visibility::VISIBLE );

            $arrCriteria[]  = new Criterion\LogicalAnd($arr2Criteria);
        }

        $query->filter  = new Criterion\LogicalOr( $arrCriteria );

        $sorting = new SortLocationHelper();
        $sortingClause = $sorting->getSortClauseFromLocation( $rootLocation );

        $query->sortClauses = array($sortingClause);
        $result = $searchService->findLocations( $query );

        foreach ( $result->searchHits as $hit )
        {
            $items[] = $hit->valueObject;

        }

        $menuItems = array();

        // second level of main menu
        foreach( $items as $item )
        {
            $location = $locationService->loadLocation($item->id); 
            $query = new LocationQuery();
            unset( $arrCriteria );
            unset( $arr1Criteria );
            unset( $arr2Criteria );

            if ( in_array( 'folder', $identifiers ) )
            {
                $arr1Criteria[] = new Criterion\ParentLocationId( $item->id );
                $arr1Criteria[] = new Criterion\ContentTypeIdentifier( array( 'folder' ) );
                $arr1Criteria[] = new Criterion\Visibility( Criterion\Visibility::VISIBLE );
                $arr1Criteria[] = new Criterion\Field( "hide_from_menu", Criterion\Operator::EQ, false );

                $arrCriteria[]  = new Criterion\LogicalAnd($arr1Criteria);
            }

            if ( $otherIdentifiers )
            {
                $arr2Criteria[] = new Criterion\ParentLocationId( $item->id );
                $arr2Criteria[] = new Criterion\ContentTypeIdentifier( $otherIdentifiers );
                $arr2Criteria[] = new Criterion\Visibility( Criterion\Visibility::VISIBLE );

                $arrCriteria[]  = new Criterion\LogicalAnd($arr2Criteria);
            }

            $query->filter  = new Criterion\LogicalOr( $arrCriteria );

            $sorting = new SortLocationHelper();
            $sortingClause = $sorting->getSortClauseFromLocation( $location );

            $query->sortClauses = array($sortingClause);
            $subResult = $searchService->findLocations( $query );

            $subItems = array();

            foreach ( $subResult->searchHits as $hit )
            {
                $subItems[] = $hit->valueObject;
            }
            
            $menuItems[] = array(
                'location' => $item,
                'subLevelItemCount' => count($subItems),
                'subLevelItems' => $subItems
            );
        }


        $response = new Response();
        $response->headers->set( 'X-Location-Id', $rootLocation->id );
        $response->setSharedMaxAge( 3600 );
        $response->setVary( 'X-User-Hash' );

        return $this->render(
            'tfkfarteBundle:menu:main_menu.html.twig',
            array(
                'menuItems' => $menuItems,
                'contentTypesIdentifiers' => $this->getMenuIdentifierIds( $identifiers )
            ),
            $response
        );
    }

    public function getMenuIdentifierIds( $identifiers )
    {
        $contentTypeService = $this->getRepository()->getContentTypeService();
        $contentTypesIdentifierIds = array();
        foreach ( $identifiers as $identifier )
        {
            try
            {
                $contentType = $contentTypeService->loadContentTypeByIdentifier( $identifier );
                $contentTypesIdentifierIds[$contentType->id] = $identifier;
            }
            catch ( \eZ\Publish\API\Repository\Exceptions\NotFoundException $e )
            {
                //return;
            }    
        }
        return $contentTypesIdentifierIds;
    }  
}
