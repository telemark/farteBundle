<?php

namespace tfk\farteBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use eZ\Publish\API\Repository\Values\Content\Query;
use eZ\Publish\API\Repository\Values\Content\Query\Criterion\ParentLocationId;
use Symfony\Component\HttpFoundation\Response;

class DefaultController extends Controller
{
    public function indexAction($name)
    {
        return $this->render('tfkfarteBundle:Default:index.html.twig', array('name' => $name));
    }
    public function mainMenuAction($locationId) {

        $currentLocation = $this->getRepository()->getLocationService()->loadLocation( $locationId );
        $results = $this->getRepository()->getLocationService()->loadLocationChildren( $currentLocation );
        $locationList = array();
        $subLocationList = array();
        foreach ( $results->locations as $result ) {

            $currentLocation = $this->getRepository()->getLocationService()->loadLocation( $result->contentInfo->mainLocationId );
            $content = $this->getRepository()->getContentService()->loadContent($currentLocation->contentInfo->id);


            if ($content->fields['show_in_menu']['nor-NO']->bool === true ) {
                $locationList[] = $currentLocation;
                $subresults = $this->getRepository()->getLocationService()->loadLocationChildren( $currentLocation );
                foreach ($subresults->locations as $subresult) {
                    if (!empty($subresult)) {
                        $subLocationList[$result->contentInfo->mainLocationId][] = $this->getRepository()->getLocationService()->loadLocation( $subresult->contentInfo->mainLocationId );
                    }
                }
            }
                
            
        }
        return $this->render('tfkfarteBundle:parts:menu_main.html.twig', array( 'list' => $locationList, 'sublist' => $subLocationList) );
    }
    public function searchStationAction($name)
        {

        //Remove district from searchstring
        $remove=strrchr($name,'(');
        $name=str_replace(" $remove","",$name);

        $response = new Response;
        $response->setPublic();
        $response->setMaxAge( 5 );

        $name = rawurlencode($name);

        $json = file_get_contents("http://reis.trafikanten.no/ReisRest/Place/FindPlaces/".$name);

       /* $result = '[';
        foreach (json_decode($json) as $item) {
            $result .= '{';
            $result .= '"District":"' . $item->District . '",';
            $result .= '"ID":' . $item->ID . ',';
            $result .= '"Name":"' . $item->Name . '"';
            $result .= '},';
            //if (next($item)==true) $result .= ',';

            if ($item->Type == 3) {
                foreach ($item->Houses as $house) {
                    $result .= '{';
                    $result .= '"District":"' . $item->District . '",';
                    $result .= '"ID":"x' . $house->X . 'y' . $house->Y . '",';
                    $result .= '"Name":"' . $item->Name . ' ' . $house->Name . '"';
                    $result .= '},';
                   // if (next($item)==true) $result .= ',';
                }
            }
        }
        $result = substr_replace($result, "", -1);
        $result .= ']';
        //var_dump($json);
        //var_dump($result);
        */
        $response->setContent($json);
        return $response;
    }

    public function searchResultAction($fromplace, $fromplaceid, $toplace, $toplaceid, $time, $transport, $arrival, $from_nr, $from_coor, $to_nr, $to_coor)
    {
        //Set the etag and modification date on the response
        //$response = $this->buildResponse(
        //    __METHOD__ . $subTreeLocationId,
        //    $modificationDate
        //);

        //If nothing has been modified, return a 304
        //if ( $response->isNotModified( $this->getRequest() ) )
        //{
        //    return $response;
        //}
        if ($from_nr != 0) {
            $x = substr($from_coor, 0, 6);
            $y = substr($from_coor, 6, 12);
            $from = file_get_contents('http://api-test.trafikanten.no/Place/GetClosestStopsByCoordinates/?coordinates=(X=' . $x . ',Y=' . $y . ')&proposals=1');
            //$from = (array)$from;
            //$from_result = (array) json_decode($from, true);
            foreach (json_decode($from) as $item) {
                $id = $item->ID;
                $walkingDistance = $item->WalkingDistance;
                $fromWalkingTime = (int) $walkingDistance / 70;
                $fromWalkingTime = round($fromWalkingTime);
            }
            $fromplaceid = $id;
        } else {
            $fromWalkingTime = 0;
        }

        if ($to_nr != 0) {
            $x = substr($to_coor, 0, 6);
            $y = substr($to_coor, 6, 12);
            $to = file_get_contents('http://api-test.trafikanten.no/Place/GetClosestStopsByCoordinates/?coordinates=(X=' . $x . ',Y=' . $y . ')&proposals=1');
            //$from = (array)$from;
            //$from_result = (array) json_decode($from, true);
            foreach (json_decode($to) as $item) {
                $id = $item->ID;
                $walkingDistance = $item->WalkingDistance;
                $toWalkingTime = (int) $walkingDistance / 70;
                $toWalkingTime = round($toWalkingTime);
            }
            $toplaceid = $id;
        } else {
            $toWalkingTime = 0;
        }


        $response = new Response;
        $response->setPublic();

        $url = "http://api.trafikanten.no/reisrest/Travel/GetTravelsByPlaces/?";
        $url .= "time=";
        $url .= $time;
        $url .= "&toplace=";
        $url .= $toplaceid;
        $url .= "&fromplace=";
        $url .= $fromplaceid;
        $url .= "&changeMargin=";
        $url .= "2";
        $url .= "&changePunish=";
        $url .= "30";
        $url .= "&walkingFactor=";
        $url .= "100";
        $url .= "&walkingDistance=";
        $url .= "2000";
        $url .= "&isAfter=";
        $url .= $arrival;
        $url .= "&proposals=";
        $url .= "10";
        $url .= "&transporttypes=";
        $url .= $transport;

        $json = file_get_contents($url);
        $result = (array) json_decode($json, true);

        $remove=strrchr($fromplace,'(');
        $fromplace=str_replace(" $remove","",$fromplace);
        $remove=strrchr($toplace,'(');
        $toplace=str_replace(" $remove","",$toplace);

        //Render the output
        return $this->render(
            'VPRuterBundle::searchresult.html.twig',
            array('result' => $result, 'fromplace' => $fromplace, 'fromplaceid' => $fromplaceid, 'toplace' => $toplace, 'toplaceid' => $toplaceid,
                'time' => $time, 'transport' => $transport, 'arrival' => $arrival, 'fromWalkingTime' => $fromWalkingTime, 'toWalkingTime' => $toWalkingTime, 'from_nr' => $from_nr, 'to_nr' => $to_nr)
        );
    }
}
