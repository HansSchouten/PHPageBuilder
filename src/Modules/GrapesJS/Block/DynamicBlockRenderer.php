<?php

namespace PHPageBuilder\Modules\GrapesJS\Block;

class DynamicBlockRenderer {
    public function render($themeBlock, $blockData, $vars = [], $controller = null, $model = null) {
        // init additional variables that should be accessible in the view
        foreach($vars as $key => $value)
            $$key = $value;

        // unset variables that should be inaccessible inside the view
        unset($controller, $model, $blockData);

        ob_start();
        require $themeBlock->getViewFile();
        $html = ob_get_contents();
        ob_end_clean();

        return $html;
    }

    public function isDynamicBlock($folder) {
        return file_exists($folder . '/view.php');
    }

    public function getViewFile($folder) {
        return $folder . '/view.php';
    }
}