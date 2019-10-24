<?php

namespace PHPageBuilder;

use PDO;

class DB
{
    /**
     * @var PDO $pdo
     */
    protected $pdo;

    /**
     * DB constructor.
     *
     * @param array $config
     */
    public function __construct(array $config)
    {
        $this->pdo = new PDO(
            $config['driver'] . ':host=' . $config['host'] . ';dbname=' . $config['database'] . ';charset=' . $config['charset'],
            $config['username'],
            $config['password']
        );
    }

    public function all($table)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM {$table}");
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function findWithId($table, $id)
    {
        $stmt = $this->pdo->query("SELECT * FROM {$table} WHERE `id` = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }
}
