<?php

namespace PHPageBuilder;

class Extensions {

    /**
     * Blocks that can be added by plugins / composer packages.
     */
    protected static array $blocks  = [];

    /**
     * Layouts that can be added by plugins / composer pckages.
     */
    protected static array $layouts = [];

    /**
     * Register a single block.
     * @param string $slug
     * @param string $directoryPath
     */
    public static function registerBlock(string $slug, string $directoryPath) {
        self::$blocks[$slug] = $directoryPath;
    }

    /**
     * Register a single layout.
     * @param string $slug
     * @param string $directoryPath
     */
    public static function registerLayout(string $slug, string $directoryPath) {
        self::$layouts[$slug] = $directoryPath;
    }

    /**
     * Register multiple blocks at once.
     * @param array['$slug' => '$directoryPath'] $blocks
     */

    public static function addBlocks(array $blocks) {
        self::$blocks = array_merge(self::$blocks, $blocks);
    }

    /**
     * Register multiple blocks at once.
     * @param array['$slug' => '$directoryPath'] $layouts
     */
    public static function addLayouts(array $layouts) {
        self::$layouts = array_merge(self::$layouts, $layouts);
    }

    /**
     * Get all blocks.
     */
    public static function getBlocks() : array {
        return self::$blocks;
    }

    /**
     * Get all layouts.
     */
    public static function getLayouts() : array {
        return self::$layouts;
    }

    /**
     * Get a single block.
     */
    public static function getBlock(string $id) {
        return isset(self::$blocks[$id]) ? self::$blocks[$id] : null;
    }

    /**
     * Get a single layout.
     */
    public static function getLayout(string $id) {
        return isset(self::$layouts[$id]) ? self::$layouts[$id] : null;
    }
}