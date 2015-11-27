<VirtualHost *:80>
        ServerName ng.local.memory.game
        ServerAdmin webmaster@localhost

        DocumentRoot  your project root folder path
        <Directory />
                Options FollowSymLinks
                AllowOverride None
        </Directory>

        <Directory your project root folder path>
                Options All
                AllowOverride All
                Order allow,deny
                allow from all
        </Directory>

        ErrorLog ${APACHE_LOG_DIR}/error.log

        # Possible values include: debug, info, notice, warn, error, crit,
        # alert, emerg.
        LogLevel warn

        CustomLog ${APACHE_LOG_DIR}/access.log combined

</VirtualHost>