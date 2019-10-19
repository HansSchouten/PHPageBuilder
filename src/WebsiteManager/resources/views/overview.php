<div class="container">
    <div class="py-5 text-center">
        <h2>Website Manager</h2>
    </div>

    <div class="row">
        <div class="col-12">
            <ul class="nav nav-tabs">
                <li class="nav-item">
                    <a class="nav-link active" data-toggle="tab" href="#pages">Pages</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" data-toggle="tab" href="#menus">Menus</a>
                </li>
            </ul>

            <div class="tab-content">
                <div id="pages" class="tab-pane active">

                    <h4 class="mb-3">Pages</h4>

                    <table class="table">
                        <thead>
                        <tr>
                            <th scope="col">Name</th>
                            <th scope="col">Route</th>
                            <th scope="col">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                            <?php
                            foreach ($pages as $page):
                            ?>
                            <tr>
                                <td>
                                    <?= e($page->name) ?>
                                </td>
                                <td>
                                    <?= e($page->route) ?>
                                </td>
                                <td>
                                </td>
                            </tr>
                            <?php
                            endforeach;
                            ?>
                        </tbody>
                    </table>

                </div>
                <div id="menus" class="tab-pane">

                    <h4 class="mb-3">Menus</h4>

                </div>
            </div>
        </div>
    </div>

    <footer class="my-5 pt-5 text-muted text-center text-small">
        <p class="mb-1">Powered by <a href="https://github.com/HansSchouten/PHPagebuilder" target="_blank">PHPagebuilder</a></p>
    </footer>
</div>
