set -e

if [ -z "${BCS_BASE_PATH}" ]
then
  echo -n "" > /etc/nginx/conf.d/webbrayns-alias.locations
else
  sed -i "s;%BCS_BASE_PATH%;${BCS_BASE_PATH};g" /etc/nginx/conf.d/webbrayns-alias.locations
  sed -i "s;%BCS_NGINX_HTML_ROOT%;${BCS_NGINX_HTML_ROOT};g" /etc/nginx/conf.d/webbrayns-alias.locations
fi

sed -i "s;%BCS_NGINX_HTML_ROOT%;${BCS_NGINX_HTML_ROOT};g" /etc/nginx/conf.d/default.conf

NGINX_CONF=/etc/nginx/nginx.conf
NGINX_LOG_DIR=/var/log/nginx

chmod -R 777 /var/cache/nginx
sed -i -e '/user/!b' -e '/nginx/!b' -e '/nginx/d' ${NGINX_CONF}
sed -i 's!/var/run/nginx.pid!/var/cache/nginx/nginx.pid!g' ${NGINX_CONF}
ln -sf /dev/stdout ${NGINX_LOG_DIR}/access.log
ln -sf /dev/stderr ${NGINX_LOG_DIR}/error.log
