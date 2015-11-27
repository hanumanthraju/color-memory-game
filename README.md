# Colour Memory

The goal of this work sample is to construct a game called "Colour Memory". The game board consists of a 4x4 grid, all in all 16 slots. All slots consists of cards face-down. The player is to flip two of these upwards each round, trying to find equals. If the two cards are equal, the player receives one point, and the cards are removed from the game board. Otherwise, the player loses one point and the cards are turned face-down again. This continues until all pairs have been found.

## Technologies used

This game is developed in AngularJs ,Jquery, Prototype.js, NPM , Gulp(Build tool), PHP and MySQL.

## Prerequisites

1. Apache Nginx Server
2. PHP 5+
3. MySQL 5.6 server and client
4. nodejs and npm

## Installation Instructions

1. Download the package https://github.com/pulkitmittal/memory-game.
2. Extract it and place it in the webapps folder in your PHP installation directory.
3. Run the SQLs in the `database.sql` on your MySQL client.
4. Open terminal (command line) and `cd` into your project folder 
5. Run `npm install`
6. Run `gulp`
6. Create vhost, see vhost.md file how to create
6. Open connect.php and make sure the MySQL connection parameters are correct.
7. Start Apache, PHP, MySQL servers.
8. Open http://ng.local.memory.game/ (in your case whatever the vhost name you give) on your browser.