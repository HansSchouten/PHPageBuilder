<?php

namespace PHPageBuilder\Repositories;

use PHPageBuilder\Contracts\SettingRepositoryContract;

class SettingRepository extends BaseRepository implements SettingRepositoryContract
{
    /**
     * The pages database table.
     *
     * @var string
     */
    protected $table = 'settings';

    /**
     * SettingRepository constructor.
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Replace all website settings by the given data.
     *
     * @param array $data
     * @return bool|object|null
     */
    public function updateSettings(array $data)
    {
        $this->destroyAll();

        foreach ($data as $key => $value) {
            $this->create([
                'setting' => $key,
                'value' => $value,
            ]);
        }

        return true;
    }
}
