<?php

include 'connect.php';

// check if we can get hold of the form field
if (!isset($_POST)) {
    exit();
}

// let make sure we escape the data
$request = $_POST;

$userid = $request['userid'];
$user = $request['user'];
$email = $request['email'];
$score = $request['score'];
$moves = $request['moves'];
$time = $request['time'];

if($userid == 0) {
    $query = "INSERT INTO player (name, email) VALUES ('$user', '$email')";
	$mysqli->query($query);
	$userid = $mysqli->insert_id;
}

$query = "INSERT INTO game (userid, score, time, moves, timestamp) VALUES ($userid, $score, $time, $moves, now())";
$mysqli->query($query);
$id = $mysqli->insert_id;

// setup our response "object"
$resp = new stdClass();
$resp->success = false;
if($id>0) {
    $resp->success = true;
    $resp->userid = $userid;
    $resp->name = $user;
    $resp->email = $email;
}

print json_encode($resp);
?>