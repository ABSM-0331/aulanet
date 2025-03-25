<?php

$archivo = __DIR__ . "/dbconexion.ini";


class DBC
{
	private static $instance = null;



	private static $dbcInfo = array(
		'host' => 'localhost',
		'db' => 'edu_dual',
		'user' => 'root',
		'password' => ''
	);

	private static $iniFile = 'dbconexion.ini';

	public static function get()
	{
		if (self::$instance == null) {
			try {
				if (file_exists(self::$iniFile)) {
					self::$dbcInfo = parse_ini_file(self::$iniFile);
				}
				self::$instance = new PDO(
					'mysql:host=' . self::$dbcInfo['host'] . ';dbname=' . self::$dbcInfo['db'],
					self::$dbcInfo['user'],
					self::$dbcInfo['password'],
					array(
						PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8",
						PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
						PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
						PDO::MYSQL_ATTR_INIT_COMMAND => "SET lc_time_names='es_ES'",

					)
				);
			} catch (PDOException $e) {
				echo "Error!: " . $e->getMessage() . "<br/>";
				die();
			}
		}
		return self::$instance;
	}

	public function getPrepareSets($arr)
	{
		$prepareSets = array();
		foreach ($arr as $column => $value) {
			$prepareSets[] = "`$column` = :" . $column;
		}
		return $prepareSets;
	}
}
