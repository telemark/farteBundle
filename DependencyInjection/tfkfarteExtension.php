<?php

namespace tfk\farteBundle\DependencyInjection;

use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\Config\Resource\FileResource;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\Extension\PrependExtensionInterface;
use Symfony\Component\HttpKernel\DependencyInjection\Extension;
use Symfony\Component\DependencyInjection\Loader;
use Symfony\Component\Yaml\Yaml;

/**
 * This is the class that loads and manages your bundle configuration
 *
 * To learn more see {@link http://symfony.com/doc/current/cookbook/bundles/extension.html}
 */
class tfkfarteExtension extends Extension implements PrependExtensionInterface
{
    /**
     * {@inheritdoc}
     */
    public function load(array $configs, ContainerBuilder $container)
    {
        $configuration = new Configuration();
        $config = $this->processConfiguration($configuration, $configs);

        $loader = new Loader\YamlFileLoader($container, new FileLocator(__DIR__.'/../Resources/config'));
        $loader->load('services.yml');
                // Default settings
        $loader->load( 'default_settings.yml' );
    }

    /**
     * Loads tfkfarteBundle configuration.
     *
     * @param ContainerBuilder $container
     */
    public function prepend( ContainerBuilder $container )
    {
        // Add legacy bundle settings only if it's present.
        if ( $container->hasExtension( 'ez_publish_legacy' ) )
        {
            $legacyConfigFile = __DIR__ . '/../Resources/config/legacy_settings.yml';
            $config = Yaml::parse( file_get_contents( $legacyConfigFile ) );
            $container->prependExtensionConfig( 'ez_publish_legacy', $config );
            $container->addResource( new FileResource( $legacyConfigFile ) );
        }
        $configFile = __DIR__ . '/../Resources/config/override.yml';
        $config = Yaml::parse( file_get_contents( $configFile ) );
        $container->prependExtensionConfig( 'ezpublish', $config );
        $container->addResource( new FileResource( $configFile ) );

        $configFile = __DIR__ . '/../Resources/config/image_variations.yml';
        $config = Yaml::parse( file_get_contents( $configFile ) );
        $container->prependExtensionConfig( 'ezpublish', $config );
        $container->addResource( new FileResource( $configFile ) );
    }
}
