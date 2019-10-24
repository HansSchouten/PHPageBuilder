<?php

namespace PHPageBuilder\Repositories;

use PHPageBuilder\Core\DB;

class BaseRepository
{
    /**
     * @var DB $db
     */
    protected $db;

    /**
     * The database table of this repository.
     *
     * @var string
     */
    protected $table;

    /**
     * The class that represents each record of this repository's table.
     *
     * @var string
     */
    protected $class;

    /**
     * Repository constructor.
     */
    public function __construct()
    {
        global $phpb_db;
        $this->db = $phpb_db;
    }

    /**
     * Create a new instance using the given data.
     *
     * @param array $data
     * @return object|null
     */
    public function create(array $data)
    {
        $columns = implode(', ', array_keys($data));
        $questionMarks = implode(', ', array_fill(0, sizeof($data), '?'));
        $this->db->query(
            "INSERT INTO {$this->table} ({$columns}) VALUES ({$questionMarks})",
            array_values($data)
        );
        $id = $this->db->lastInsertId();
        if ($id) {
            return $this->findWithId($id);
        }
        return null;
    }

    /**
     * Update the record with the given id with the given updated data.
     *
     * @param $instance
     * @param array $data
     * @return bool
     */
    public function update($instance, array $data)
    {
        $set = '';
        foreach ($data as $column => $value) {
            if ($set !== '') {
                $set .= ', ';
            }
            $set .= $column . '=?';
        }

        $values = array_values($data);
        $values[] = $instance->id;

        return $this->db->query(
            "UPDATE {$this->table} SET {$set} WHERE id=?",
            $values
        );
    }

    /**
     * Destroy the given instance in the database.
     *
     * @param $id
     * @return bool
     */
    public function destroy($id)
    {
        return $this->db->query(
            "DELETE FROM {$this->table} WHERE id=?",
            [$id]
        );
    }

    /**
     * Return an array of all pages.
     *
     * @return array
     */
    public function getAll()
    {
        return $this->createInstances($this->db->all($this->table));
    }

    /**
     * Return the instance with the given id, or null.
     *
     * @param string $id
     * @return object|null
     */
    public function findWithId($id)
    {
        return $this->createInstance($this->db->findWithId($this->table, $id));
    }

    /**
     * Create an instance using the first record.
     *
     * @param array $records
     * @return object|null
     */
    protected function createInstance(array $records)
    {
        $instances = $this->createInstances($records);
        if (empty($instances)) {
            return null;
        }
        return $instances[0];
    }

    /**
     * For each record create an instance.
     *
     * @param array $records
     * @return array
     */
    protected function createInstances(array $records)
    {
        $result = [];
        foreach ($records as $record) {
            $instance = new $this->class;
            foreach($record as $k => $v) {
                $instance->$k = $v;
            }
            $result[] = $instance;
        }

        return $result;
    }
}
