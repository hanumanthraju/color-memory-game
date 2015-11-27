<?php

include 'connect.php';

$resp = new stdClass();

$query = "SELECT count(*), max(score) FROM game where userid = ".$_POST['userid'];
if($result = $mysqli->query($query)) {
    
    /* fetch object array */
    $obj = new stdClass();
    while ($row = $result->fetch_row()) {
        $obj->count = $row[0];
        $obj->max = $row[1];
    }

    $resp->success = true;
    $resp->obj = $obj;
    /* free result set */
    $result->close();
} else {
    $resp->success = false;
}

print json_encode($resp);
?>