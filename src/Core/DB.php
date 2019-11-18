<?php

namespace PHPageBuilder\Core;

use PDO;

/**
 * Class DB
 *
 * A basic shell around PDO.
 *
 * @package PHPageBuilder\Core
 */
class DB
{
    /**
     * @var PDO $pdo
     */
    protected $pdo;

    /**
     * @var string $prefix
     */
    protected $prefix;

    /**
     * DB constructor.
     *
     * @param array $config
     */
    public function __construct(array $config)
    {
        $this->prefix = phpb_config('storage.database.prefix');

        $this->pdo = new PDO(
            $config['driver'] . ':host=' . $config['host'] . ';dbname=' . $config['database'] . ';charset=' . $config['charset'],
            $config['username'],
            $config['password'],
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
    }

    /**
     * Return the given table name with prefix.
     *
     * @param $table
     * @return string
     */
    protected function prefixTable($table)
    {
        return $this->prefix . preg_replace('\W*', '', $table);
    }

    /**
     * Return the id of the last inserted record.
     *
     * @return string
     */
    public function lastInsertId()
    {
        return $this->pdo->lastInsertId();
    }

    /**
     * Return all records of the given table and return instances of the given class.
     *
     * @param string $table
     * @return array
     */
    public function all(string $table)
    {
        $table = $this->prefixTable($table);
        $stmt = $this->pdo->prepare("SELECT * FROM {$table}");
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Return the first record of the given table as an instance of the given class.
     *
     * @param string $table
     * @param $id
     * @return mixed
     */
    public function findWithId(string $table, $id)
    {
        $table = $this->prefixTable($table);
        $stmt = $this->pdo->prepare("SELECT * FROM {$table} WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetchAll();
    }

    /**
     * Perform a custom select query with user input data passed as $parameters.
     *
     * @param string $query
     * @param array $parameters
     * @return array
     */
    public function select(string $query, array $parameters)
    {
        $stmt = $this->pdo->prepare($query);
        $stmt->execute($parameters);
        return $stmt->fetchAll();
    }

    /**
     * Perform a custom query with user input data passed as $parameters.
     *
     * @param string $query
     * @param array $parameters
     * @return bool
     */
    public function query(string $query, array $parameters = [])
    {
        $stmt = $this->pdo->prepare($query);
        return $stmt->execute($parameters);
    }
}
