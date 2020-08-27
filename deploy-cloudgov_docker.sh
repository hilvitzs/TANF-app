#!/bin/sh
#
# This script will attempt to create the services required
# and then launch everything.
#

# These are the hostnames and docker image file names
DEPLOY_STRATEGY=${1}
DEPLOY_ENV=${2}
CGHOSTNAME_BACKEND=${3}
CGHOSTNAME_FRONTEND=${4}
DOCKER_IMAGE_BACKEND=${5}
DOCKER_IMAGE_FRONTEND=${6}
CIRCLE_BRANCH=${7}

echo DEPLOY_STRATEGY: $DEPLOY_STRATEGY
echo DEPLOY_ENV=$DEPLOY_ENV
echo BACKEND_HOST: $CGHOSTNAME_BACKEND
echo FRONTEND_HOST: $CGHOSTNAME_FRONTEND
echo DOCKER_BACKEND_IMAGE: $DOCKER_IMAGE_BACKEND
echo DOCKER_FRONTEND_IMAGE: $DOCKER_IMAGE_FRONTEND
echo CIRCLE_BRANCH=$CIRCLE_BRANCH


# function to check if a service exists
service_exists()
{
  cf service "$1" >/dev/null 2>&1
}

update_frontend()
{
	if [ "$1" = "rolling" ] ; then
		# Do a zero downtime deploy.  This requires enough memory for
		# two apps to exist in the org/space at one time.
		cf push $CGHOSTNAME_FRONTEND --no-route -f tdrs-frontend/manifest.yml --var docker-frontend=$DOCKER_IMAGE_FRONTEND --strategy rolling || exit 1
	else
		cf push $CGHOSTNAME_FRONTEND --no-route -f tdrs-frontend/manifest.yml --var docker-frontend=$DOCKER_IMAGE_FRONTEND
	fi
	cf map-route $CGHOSTNAME_FRONTEND app.cloud.gov --hostname "${CGHOSTNAME_FRONTEND}"
}

update_backend()
{
	if [ "$1" = "rolling" ] ; then
		# Do a zero downtime deploy.  This requires enough memory for
		# two apps to exist in the org/space at one time.
		cf push $CGHOSTNAME_BACKEND --no-route -f tdrs-backend/manifest.yml --var docker-backend=$DOCKER_IMAGE_BACKEND --strategy rolling || exit 1

	else
		cf push $CGHOSTNAME_BACKEND --no-route -f tdrs-backend/manifest.yml --var docker-backend=$DOCKER_IMAGE_BACKEND
		# set up JWT key if needed
		if cf e $CGHOSTNAME_BACKEND | grep -q JWT_KEY ; then
		   echo jwt cert already created
		else
		   export SETUPJWT="True"
	   fi
	fi
	cf map-route $CGHOSTNAME_BACKEND app.cloud.gov --hostname "$CGHOSTNAME_BACKEND"
}

# perform a rolling update for the backend and frontend deployments
if [ $DEPLOY_STRATEGY = "rolling" ] ; then

	update_backend 'rolling'
	update_frontend 'rolling'
fi

if [ "$1" = "setup" ] ; then  echo
	# create services (if needed)
	if service_exists "tdp-app-deployer" ; then
	  echo tdp-app-deployer already created
	else
	  cf create-service cloud-gov-service-account space-deployer tdp-app-keys
	  cf create-service-key tdp-app-keys deployer
	  echo "to get the CF_USERNAME and CF_PASSWORD, execute 'cf service-key tdp-app-keys deployer'"
	fi

	if service_exists "db-raft" ; then
	  echo db-raft already created
	else
	  if [ $DEPLOY_ENV = "prod" ] ; then
	    cf create-service aws-rds medium-psql-redundant db-raft
		  echo sleeping until db is awake
		  for i in 1 2 3 ; do
		  	sleep 60
		  	echo $i minutes...
		  done
	  else
	    cf create-service aws-rds shared-psql db-raft
	    sleep 2
	  fi
	fi

	# set up backend
	if cf app $CGHOSTNAME_BACKEND >/dev/null 2>&1 ; then
		echo $CGHOSTNAME_BACKEND app already set up
	else
	    update_backend
		cf bind-service $CGHOSTNAME_BACKEND db-raft
		cf restage $CGHOSTNAME_BACKEND
	fi

	# set up frontend
	if cf app $CGHOSTNAME_FRONTEND >/dev/null 2>&1 ; then
		echo $CGHOSTNAME_FRONTEND app already set up
	else
	    update_frontend
	fi
fi

generate_jwt_cert() 
{
	echo "regenerating JWT cert/key"
	yes 'XX' | openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -sha256
	cf set-env $CGHOSTNAME_BACKEND JWT_CERT "$(cat cert.pem)"
	cf set-env $CGHOSTNAME_BACKEND JWT_KEY "$(cat key.pem)"

	# make sure that we have something set that you can later override with the
	# proper value so that the app can start up
	if cf e $CGHOSTNAME_BACKEND | grep -q OIDC_RP_CLIENT_ID ; then
		echo OIDC_RP_CLIENT_ID already set up
	else
		echo "once you have gotten your client ID set up with login.gov, you will need to set the OIDC_RP_CLIENT_ID to the proper value"
		echo "you can do this by running: cf set-env tdp-backend OIDC_RP_CLIENT_ID 'your_client_id'"
		echo "login.gov will need this cert when you are creating the app:"
		cat cert.pem
		cf set-env $CGHOSTNAME_BACKEND OIDC_RP_CLIENT_ID "XXX"
	fi
}

# regenerate jwt cert
if [ "$1" = "regenjwt" ] ; then
	generate_jwt_cert
fi


# tell people where to go
echo
echo
echo "to log into the site, you will want to go to https://${CGHOSTNAME_FRONTEND}.app.cloud.gov/"
echo 'Have fun!'