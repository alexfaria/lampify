docker run --name lamps -e VIRTUAL_HOST=<VIRTUAL_HOST_URL> -d -p 80:80 -v <WEBSITE_FOLDER>:/var/www/html tobi312/rpi-nginx
