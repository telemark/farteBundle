<?php

namespace tfk\farteBundle\Controller;

use eZ\Bundle\EzPublishCoreBundle\Controller;
use eZ\Publish\API\Repository\Values\Content\Location;
use eZ\Publish\API\Repository\Values\Content\Query;
use eZ\Publish\API\Repository\Values\Content\Query\Criterion;
use eZ\Publish\API\Repository\Values\Content\Query\SortClause;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class ReiseplanleggerController extends Controller
{

    public function holdeplasserAction ($val) {

        $searchString = $val;
        $response = array();
        $travelmagic_url = "https://reiseplanlegger.farte.no";
        $cnt = 10;
        $values = array();

        if ($searchString !== "") {
          $xml = file_get_contents($travelmagic_url . "/scripts/TravelMagic/TravelMagicWE.dll/StageXML?cnt=$cnt&filter=".urlencode($searchString));
          $sxm = simplexml_load_string($xml);

          foreach ($sxm->i as $i) {
            array_push($values, $this->stageNameWithoutType($i['n']));
          }

          foreach (array_unique($values) as $v) {

            $response[] = array( 'title' => htmlspecialchars_decode($v));

          }
        }

        $response = new Response(json_encode($response));
        $response->headers->set('Content-Type', 'application/json');

        return $response;

        //return new JsonResponse($response);

        /*return $this->render('VPHedmarkTrafikkBundle:parts:holdeplasser.html.twig',
            array(
                'response' => $response
            )
        );*/

    }

    public function stageNameWithoutType($value)
    {
      if (preg_match("/^(.*)\[(.*)\]/", $value, $matches))
      {
        return $matches[1];
      }
      return $value;
    }

    public function sokAction(Request $request) {

        $content = $this->getRepository()->getContentService()->loadContent(172);
        $location = $this->getRepository()->getLocationService()->loadLocation(172);

        $from = $request->request->get('from');
        $to = $request->request->get('to');
        $date = $request->request->get('date');
        $time = $request->request->get('time');

        $iframeUrl = 'https://reiseplanlegger.farte.no/scripts/TravelMagic/TravelMagicWE.dll/svar?'
                    . 'from=' . urlencode($from)
                    . "&to=" . urlencode($to)
                    . "&date=" . urlencode($date)
                    . "&time=" . $time;

      return $this->render(
          "tfkfarteBundle:full:reiseplanlegger.html.twig",
          array(
            'iframeUrl' => $iframeUrl,
            'content' => $content,
            'location' => $location
          )
      );

    }

    public function sanntidAction(Request $request) {

        $content = $this->getRepository()->getContentService()->loadContent(173);
        $location = $this->getRepository()->getLocationService()->loadLocation(173);

        $iframeUrl = 'https://reiseplanlegger.farte.no/scripts/TravelMagic/TravelMagicWE.dll/?dep1=1&now=1';

      return $this->render (
          "tfkfarteBundle:full:reiseplanlegger_sanntid.html.twig",
            array(
            'iframeUrl' => $iframeUrl
          )
      );
    }


}