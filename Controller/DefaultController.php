<?php

namespace tfk\farteBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    public function indexAction($name)
    {
        return $this->render('tfkfarteBundle:Default:index.html.twig', array('name' => $name));
    }
}
