<?php

namespace tfk\farteBundle\Controller;

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
use eZ\Bundle\EzPublishCoreBundle\Controller;
use Pagerfanta\Pagerfanta;

class ItemController extends Controller {

	/**
     * Displays breadcrumb for a given $locationId
     *
     * @param mixed $locationId
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function viewBreadcrumbAction( $locationId )
    {
        /** @var WhiteOctober\BreadcrumbsBundle\Templating\Helper\BreadcrumbsHelper $breadcrumbs */
        $breadcrumbs = $this->get( "white_october_breadcrumbs" );

        $locationService = $this->getRepository()->getLocationService();
        $path = $locationService->loadLocation( $locationId )->path;

        // The root location can be defined at site access level
        $rootLocationId = $this->getConfigResolver()->getParameter( 'content.tree_root.location_id' );

        /** @var eZ\Publish\Core\Helper\TranslationHelper $translationHelper */
        $translationHelper = $this->get( 'ezpublish.translation_helper' );

        $isRootLocation = false;

        // Shift of location "1" from path as it is not a fully valid location and not readable by most users
        array_shift( $path );

        for ( $i = 0; $i < count( $path ); $i++ )
        {
            $location = $locationService->loadLocation( $path[$i] );
            // if root location hasn't been found yet
            if ( !$isRootLocation )
            {
                // If we reach the root location We begin to add item to the breadcrumb from it
                if ( $location->id == $rootLocationId )
                {
                    $isRootLocation = true;
                    $breadcrumbs->addItem(
                        $translationHelper->getTranslatedContentNameByContentInfo( $location->contentInfo ),
                        $this->generateUrl( $location )
                    );
                }
            }
            // The root location has already been reached, so we can add items to the breadcrumb
            else
            {
                $breadcrumbs->addItem(
                    $translationHelper->getTranslatedContentNameByContentInfo( $location->contentInfo ),
                    $this->generateUrl( $location )
                );
            }
        }

        // We don't want the breadcrumb to be displayed if we are on the frontpage
        // which means we display it only if we have several items in it
        if ( count( $breadcrumbs ) <= 1 )
        {
            return new Response();
        }
        return $this->render(
            'tfktelemarkBundle::breadcrumb.html.twig'
        );
    }
	public function messagesAction($locationId, $params = array()) {
		// children
        // Setting HTTP cache for the response to be public and with a TTL of 1 day.
        $response = new Response;

        $response->setPublic();
        $response->setSharedMaxAge( 86400 );
        // Menu will expire when top location cache expires.
        $response->headers->set( 'X-Location-Id', $locationId );
        // Menu might vary depending on user permissions, so make the cache vary on the user hash.
        $response->setVary( 'X-User-Hash' );

        $location  = $this->getRepository()->getLocationService()->loadLocation( $locationId );
        $content = $this->getRepository()->getContentService()->loadContentByContentInfo( $location->getContentInfo() );

        $searchService = $this->getRepository()->getSearchService();
        $query = new Query();
        $query->criterion = new Criterion\LogicalAnd( array(
                new Criterion\ContentTypeIdentifier($params['class']),
                new Criterion\ParentLocationId($locationId),
                new Criterion\Visibility( Criterion\Visibility::VISIBLE )
            ) );
        $query->sortClauses = $this->getSortOrder($location);

        $query->limit =4;

        $items = array();
        $result = $searchService->findContent( $query );
        if ($result->totalCount > 0) {
            foreach ($result->searchHits as $item) {
                $itemLoc  = $this->getRepository()->getLocationService()->loadLocation( $item->valueObject->contentInfo->mainLocationId );
                if (!$itemLoc->invisible)
                    $items[] = $item->valueObject;
            }
        }

        return $this->render(
            'tfktelemarkBundle:parts:child_loop.html.twig',
            array(
                'items' => $items,
                'location' => $location,
                'content' => $content,
				'viewType' => $params['viewType'],
                'params' => $params
            ), $response );
    }
    public function randomChildAction($locationId, $params = array()) {
        // children
        // Setting HTTP cache for the response to be public and with a TTL of 1 day.
        $response = new Response;

        $response->setPublic();
        $response->setSharedMaxAge( 86400 );
        // Menu will expire when top location cache expires.
        $response->headers->set( 'X-Location-Id', $locationId );
        // Menu might vary depending on user permissions, so make the cache vary on the user hash.
        $response->setVary( 'X-User-Hash' );

        $location  = $this->getRepository()->getLocationService()->loadLocation( $locationId );
        $content = $this->getRepository()->getContentService()->loadContentByContentInfo( $location->getContentInfo() );

        $searchService = $this->getRepository()->getSearchService();
        $query = new Query();
        $query->criterion = new Criterion\LogicalAnd( array(
                new Criterion\ContentTypeIdentifier($params['class']),
                new Criterion\ParentLocationId($locationId),
                new Criterion\Visibility( Criterion\Visibility::VISIBLE )
            ) );
        $query->sortClauses = array(
            new SortClause\LocationPriority( Query::SORT_DESC ),
            new SortClause\DatePublished( Query::SORT_DESC )
        );

        $items = array();
        $result = $searchService->findContent( $query );
        if ($result->totalCount > 0) {
            foreach ($result->searchHits as $item) {
                $itemLoc  = $this->getRepository()->getLocationService()->loadLocation( $item->valueObject->contentInfo->mainLocationId );
                if (!$itemLoc->invisible)
                    $items[] = $item->valueObject;
            }
        }

        $random_items = array($items[array_rand($items)]);

        return $this->render(
            'tfktelemarkBundle:parts:child_loop.html.twig',
            array(
                'items' => $random_items,
                'location' => $location,
                'content' => $content,
                'viewType' => $params['viewType'],
                'params' => $params
            ), $response );
    }
	public function mainMenuAction($locationId) {

        $currentLocation = $this->getRepository()->getLocationService()->loadLocation( $locationId );
        $results = $this->getRepository()->getLocationService()->loadLocationChildren( $currentLocation );
        $locationList = array();
        $subLocationList = array();
        foreach ( $results->locations as $result ) {

            $currentLocation = $this->getRepository()->getLocationService()->loadLocation( $result->contentInfo->mainLocationId );
            $content = $this->getRepository()->getContentService()->loadContent($currentLocation->contentInfo->id);

            if ($content->getFieldValue('hide_from_main_menu') == '0') {
                $locationList[] = $currentLocation;
                $subresults = $this->getRepository()->getLocationService()->loadLocationChildren( $currentLocation );
                foreach ($subresults->locations as $subresult) {
                    if (!empty($subresult)) {
                        $subLocationList[$result->contentInfo->mainLocationId][] = $this->getRepository()->getLocationService()->loadLocation( $subresult->contentInfo->mainLocationId );
                    }
                }
            }


        }
        return $this->render('tfktelemarkBundle:parts:menu_main.html.twig', array( 'list' => $locationList, 'sublist' => $subLocationList) );
    }

	public function leftMenuAction($locationId) {

        $currentLocation = $this->getRepository()->getLocationService()->loadLocation( $locationId );
        $results = $this->getRepository()->getLocationService()->loadLocationChildren( $currentLocation );
        $locationList = array();
        $subLocationList = array();
        foreach ( $results->locations as $result ) {

            $currentLocation = $this->getRepository()->getLocationService()->loadLocation( $result->contentInfo->mainLocationId );
            $content = $this->getRepository()->getContentService()->loadContent($currentLocation->contentInfo->id);

                $locationList[] = $currentLocation;
                $subresults = $this->getRepository()->getLocationService()->loadLocationChildren( $currentLocation );
                foreach ($subresults->locations as $subresult) {
                    if (!empty($subresult)) {
                        $subLocationList[$result->contentInfo->mainLocationId][] = $this->getRepository()->getLocationService()->loadLocation( $subresult->contentInfo->mainLocationId );
                    }
                }
        }
        return $this->render('tfktelemarkBundle:parts:menu_left.html.twig', array( 'list' => $locationList, 'sublist' => $subLocationList) );
    }

    public function arkivAction($locationId)
    {

        // Setting HTTP cache for the response to be public and with a TTL of 1 day.
        $response = new Response;
        $response->setPublic();
        $response->setSharedMaxAge( 86400 );
        // Menu will expire when top location cache expires.
        $response->headers->set( 'X-Location-Id', $locationId );
        // Menu might vary depending on user permissions, so make the cache vary on the user hash.
        $response->setVary( 'X-User-Hash' );

        $location = $this->getRepository()->getLocationService()->loadLocation( $locationId );
        $content = $this->getRepository()->getContentService()->loadContentByContentInfo( $location->getContentInfo() );

        $searchService = $this->getRepository()->getSearchService();

        $subtree = '';
        foreach ($location->path as $value) {
            $subtree .= "/" . $value;
        }
        $subtree .= "/";
        $limit_date = date_create()->modify('-6 month')->getTimestamp();

        $query = new Query();

 		if ($content->getFieldValue('show_children') == '1') {

        $query->criterion = new Criterion\LogicalAnd( array(
                new Criterion\ContentTypeIdentifier( array('article','linkbox')),
                new Criterion\Subtree($subtree),
                new Criterion\DateMetadata(Criterion\DateMetadata::CREATED,Criterion\Operator::GT,$limit_date),
                new Criterion\Visibility( Criterion\Visibility::VISIBLE )
            ) );
        $query->sortClauses = array(
            new SortClause\LocationPriority( Query::SORT_DESC ),
            new SortClause\DatePublished( Query::SORT_DESC )
        );

        // Initialize pagination.
        $items = new Pagerfanta(
            new ContentSearchAdapter( $query, $this->getRepository()->getSearchService() )
        );
        $items->setMaxPerPage( 6 );
        $items->setCurrentPage( $this->getRequest()->get( 'page', 1 ) );

        return $this->render(
            'tfktelemarkBundle:full:folder_arkiv.html.twig',
            array(
                'items' => $items,
                'location' => $location,
                'content' => $content
            ), $response );
		}
    }

    public function infoboxRelatedAction($locationId) {
        // children
        // Setting HTTP cache for the response to be public and with a TTL of 1 day.
        $response = new Response;

        $response->setPublic();
        $response->setSharedMaxAge( 86400 );
        // Menu will expire when top location cache expires.
        $response->headers->set( 'X-Location-Id', $locationId );
        // Menu might vary depending on user permissions, so make the cache vary on the user hash.
        $response->setVary( 'X-User-Hash' );

        $location  = $this->getRepository()->getLocationService()->loadLocation( $locationId );
        $content = $this->getRepository()->getContentService()->loadContent($location->contentInfo->id );
        $related_content = $this->getRepository()->getContentService()->loadContent( $content->getFieldValue('related_object')->destinationContentId );

        $searchService = $this->getRepository()->getSearchService();
        $query = new Query();

        if ($content->getFieldValue('show_last') == '1') {

            $query->criterion = new Criterion\LogicalAnd( array(
                new Criterion\ContentTypeIdentifier(array('article', 'file')),
                new Criterion\ParentLocationId($related_content->contentInfo->mainLocationId),
                new Criterion\Visibility( Criterion\Visibility::VISIBLE )
            ) );

            $query->sortClauses = array(new SortClause\DatePublished( Query::SORT_DESC ));

            $query->limit = $content->getFieldValue('children_limit')->value;
            $items = array();
            $result = $searchService->findContent( $query );

            if ($result->totalCount > 0) {
                foreach ($result->searchHits as $item) {
                    $itemLoc  = $this->getRepository()->getLocationService()->loadLocation( $item->valueObject->contentInfo->mainLocationId );
                    if (!$itemLoc->invisible)
                        $items[] = $item->valueObject;
                }
            }

        } else {
            if ($related_content->contentInfo->contentTypeId == 44) {

                $now = time();
                $query->criterion = new Criterion\LogicalAnd( array(
                    new Criterion\ContentTypeIdentifier(array('event')),
                    new Criterion\ParentLocationId($related_content->contentInfo->mainLocationId),
                    new Criterion\Field(  'from_time', Criterion\Operator::GTE,  $now  ),
                    new Criterion\Visibility( Criterion\Visibility::VISIBLE )
                ) );

                $query->sortClauses = array(new SortClause\Field( 'event', 'from_time', Query::SORT_ASC ));

                $query->limit = $content->getFieldValue('children_limit')->value;
                $items = array();
                $result = $searchService->findContent( $query );

                if ($result->totalCount > 0) {
                    foreach ($result->searchHits as $item) {
                        $itemLoc  = $this->getRepository()->getLocationService()->loadLocation( $item->valueObject->contentInfo->mainLocationId );
                        if (!$itemLoc->invisible)
                            $items[] = $item->valueObject;
                    }
                }
            } else if ($related_content->contentInfo->contentTypeId == 65) {
                $items = array();
                $items[] = $related_content;
            } else {
                $related_location  = $this->getRepository()->getLocationService()->loadLocation( $related_content->contentInfo->mainLocationId );
                $query->criterion = new Criterion\LogicalAnd( array(
                    new Criterion\LogicalNot(new Criterion\ContentTypeIdentifier(array('infobox', 'folder', 'frontpage_article', 'event_calendar'))),
                    new Criterion\ParentLocationId($related_content->contentInfo->mainLocationId),
                    new Criterion\Visibility( Criterion\Visibility::VISIBLE )
                ) );

                $query->sortClauses = $this->getSortOrder($related_location);

                $query->limit = $content->getFieldValue('children_limit')->value;
                $items = array();
                $result = $searchService->findContent( $query );

                if ($result->totalCount > 0) {
                    foreach ($result->searchHits as $item) {
                        $itemLoc  = $this->getRepository()->getLocationService()->loadLocation( $item->valueObject->contentInfo->mainLocationId );
                        if (!$itemLoc->invisible)
                            $items[] = $item->valueObject;
                    }
                }
            }

        }

        if ($content->getFieldValue('show_intro') == '1') {
            $show_intro = true;
        } else {
            $show_intro = false;
        }

        return $this->render(
            'tfktelemarkBundle:parts:infobox_related.html.twig',
            array(
                'items' => $items,
                'show_intro' => $show_intro
            ), $response );
    }

    public function folderInitAction($locationId, $viewType, $layout = false, array $params = array()) {

        $repository = $this->getRepository();
        $location = $repository->getLocationService()->loadLocation($locationId);
        $content = $repository->getContentService()->loadContent($location->contentInfo->id);
        $show_pagination = false;
        $items = false;
        $searchService = $repository->getSearchService();

        if ($content->getFieldValue('show_pagination')->bool) {
            $show_pagination = true;
            $query = new Query();

            $query->criterion = new Criterion\LogicalAnd( array(
                    new Criterion\ContentTypeIdentifier( array('article','linkbox')),
                    new Criterion\ParentLocationId($locationId),
                    new Criterion\Visibility( Criterion\Visibility::VISIBLE )
                ) );
            $query->sortClauses = array(
                new SortClause\LocationPriority( Query::SORT_DESC ),
                new SortClause\DatePublished( Query::SORT_DESC )
            );

            // Initialize pagination.
            $items = new Pagerfanta(
                new ContentSearchAdapter( $query, $repository->getSearchService() )
            );

            $count = $content->getFieldValue('pagination_count')->value;
            if ($count == 0) $count = 12;
            $items->setMaxPerPage($count);
            $items->setCurrentPage( $this->getRequest()->get( 'page', 1 ) );
        }

        //henter eventuelle infobokser
        $query = new Query();
        $query->criterion = new Criterion\LogicalAnd( array(
                new Criterion\ContentTypeIdentifier('infobox'),
                new Criterion\ParentLocationId($locationId),
                new Criterion\Visibility( Criterion\Visibility::VISIBLE )
            ) );
        $query->sortClauses = $this->getSortOrder($location);

        $query->limit = 50;

        $infoboxes = array();
        $result = $searchService->findContent( $query );
        if ($result->totalCount > 0) {
            $infoboxes = true;
        } else {
            $infoboxes = false;
        }

        return $this->get( 'ez_content' )->viewLocation(
            $locationId,
            $viewType,
            $layout,
            array(
                'show_pagination' => $show_pagination,
                'items' => $items,
                'infoboxes' => $infoboxes
            ) + $params
        );
    }

    private function getSortOrder($location) {
        // Get sortfield data and sort results based on it. Fall back on Date Published
        // Note: Not all sort-methods have been implemented. Those that have are:
        // # 3: Date modified
        // # 5: Depth
        // # 8: Priority
        // # 9: Name
        // # 2: Date published (fallback)
        // This means that if any sort-method is chosen on the parent object, which is not implemented here, it will sort by date published
        switch ($location->sortField) {
            case 3:
                if( $location->sortOrder === 1 ) {
                    $sortBy = array( new SortClause\DateModified( Query::SORT_ASC ) );
                }
                else {
                    $sortBy = array( new SortClause\DateModified( Query::SORT_DESC ) );
                }
                break;
            case 5:
                if( $location->sortOrder === 1 ) {
                    $sortBy = array( new SortClause\LocationDepth( Query::SORT_ASC ) );
                }
                else {
                    $sortBy = array( new SortClause\LocationDepth( Query::SORT_DESC ) );
                }
                break;
            case 8:
                if( $location->sortOrder === 1 ) {
                    $sortBy = array( new SortClause\LocationPriority( Query::SORT_ASC ) );
                }
                else {
                    $sortBy = array( new SortClause\LocationPriority( Query::SORT_DESC ) );
                }
                break;
            case 9:
                if( $location->sortOrder === 1 ) {
                    $sortBy = array( new SortClause\ContentName( Query::SORT_ASC ) );
                }
                else {
                    $sortBy = array( new SortClause\ContentName( Query::SORT_DESC ) );
                }
                break;
            case 2:
                if( $location->sortOrder === 1 ) {
                    $sortBy = array( new SortClause\DatePublished( Query::SORT_ASC ) );
                }
                else {
                    $sortBy = array( new SortClause\DatePublished( Query::SORT_DESC ) );
                }
                break;
            default:
                if( $location->sortOrder === 1 ) {
                    $sortBy = array( new SortClause\DatePublished( Query::SORT_ASC ) );
                }
                else {
                    $sortBy = array( new SortClause\DatePublished( Query::SORT_DESC ) );
                }
                break;
        }

        return $sortBy;
    }
}