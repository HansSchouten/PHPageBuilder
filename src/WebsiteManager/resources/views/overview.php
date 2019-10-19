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
                            <td class="actions">
                                <a href="<?= e($page->route) ?>" target="_blank" class="btn btn-secondary btn-sm">
                                    View <i class="fas fa-eye"></i>
                                </a>
                                <a href="?route=page_settings&action=edit&page=<?= e($page->id) ?>" class="btn btn-primary btn-sm">
                                    Edit <i class="fas fa-edit"></i>
                                </a>
                                <a href="?route=page_settings&action=destroy&page=<?= e($page->id) ?>" class="btn btn-danger btn-sm">
                                    Remove <i class="fas fa-trash"></i>
                                </a>
                            </td>
                        </tr>
                        <?php
                        endforeach;
                        ?>
                    </tbody>
                </table>

                <hr class="mt-4 mb-3">
                <a href="?route=page_settings&action=create" class="btn btn-primary btn-sm">
                    Add new page
                </a>

            </div>
            <div id="menus" class="tab-pane">

                <h4 class="mb-3">Menus</h4>

            </div>
        </div>
    </div>
</div>
