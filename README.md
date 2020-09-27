# MusakBox

MusakBox is an online music streaming app that is completely serverless, and leverages AWS Cognito and S3.

It allows you to play music and manage playlists.

# Motivation

I really liked Google play music, but now that it's on the way out I wanted to find a solution that would allow me to listen to my music collection anywhere.

What I wanted:
* Inexpensive (has to be cheaper than competing solutions allowing me to upload my music collection)
* No operational overhead
* Sync my music easily
* I don't want to be locked into anything
* I don't want someone to be able to remove my access to this.

# How does it work?

So in order to accomplish these goals, I thought I'd give AWS Amplify a try so see how much bootstraping I can get done.

MusakBox is built with React on the front-end hosted in S3. The website content is served from Cloudfront.

Authentication is handled via Cognito.

All media files and playlists are stored in S3. Using temporary credentials granted by the Cognito authentication, the browser can access the stored files in S3 directly.

MusakBox uses several mechanisms to support offline play:
* Localstorage cache metadata (song list, list of saved playlists, playlist content)
* Service worker is setup to intercept all transient S3 requests for media and remap them to a consistent cache
* App can pre-cache items by communicating with service worker and requesting caching of items in playlist

# Features

* Playlists
* View by artist
* Song/Artist search
* Offline operation via client-side caching
* Regular stuff: repeat, shuffle, seek, mute

# TODO

* Media uploads (easy-ish, have done this before)
* Delete playlists (easy)
* Good sync solution (easy enough to automate with a cron-job...)
* Native apps ..work in progress, have prototypes with Electron ap (medium))
* Handle offline mode... when song missing skip to next cached song, prevent metadata operations, prevent cache clearing, prevent pre-caching (easy)
* Media keys (should be do-able)
* When pre-caching a bunch of songs, the SW appears to get stuck sometimes. Should re-factor to open a bi-directional channel with the front-end and limit concurrent requests, with timeouts and retries.
* Better detection/handling of failed requests. Ex: detect logged in state when requests fail with 400 errors and refresh token (if token refreshable).


# S3 file organization

Files are stored in S3 per Cognito user. The folder hierarchy is:

`s3://<BUCKETNAME>/private/<REGION>:<COGNITO IDENTITY ID>`

In that folder, songs are stored in `songs/`, and playlists are stored in `playlists/`.

The assumption is that files are organized by artist. Eg: `songs/ACDC/Thunderstruck.mp3`.

# Supported media

Modern browsers support:
* MP3
* WAV
* OGG
* FLAC

# Installation

Before we begin: You need to setup an AWS account. If this scares you, stop here.

Still here? Great.

Check out this repo. Next, get pre-requisites installed.

In general we'll follow the same steps as here: https://docs.amplify.aws/start/getting-started/installation/q/integration/react


```
npm install -g @aws-amplify/cli
amplify configure
```

(Follow prompts and instructions)


```
amplify init
```

(Follow prompts and instructions)

```
amplify add auth

? Do you want to use the default authentication and security configuration? Default configuration
? How do you want users to be able to sign in? Username
? Do you want to configure advanced settings?  No, I am done.

```

Add storage:

```
amplify add storage
```

Add Hosting:

```
amplify add hosting
? Select the plugin module to execute: # Hosting with Amplify Console (Managed hosting with custom domains, Continuous deployment)
? Choose a type: # Manual Deployment
```

Deploy and push

```
amplify push
amplify publish
```

Almost done. It should print out a cloudfront url you can hit your app with now.

The final step which I highly recommend is to automatically disable Cognito users as soon as they are created. If you don't do this, anyone will be able to sign up to your Cognito pool and get credentials which allow them to upload files to S3. No bueno!

You'll need to know your AWS account number, and the name of the cognito pool you created (Head on into Cognito and find the pool name). Looks like 'userpool/us-east-1_aasdfasdf'.

Once you have those, head over to the IAM console and create an IAM role with the following policy:

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:us-east-1:AWSACCOUNTNUMBERHERE:log-group:/aws/lambda/*:*:*",
            "Effect": "Allow"
        },
        {
            "Action": [
                "cognito-idp:AdminGetUser",
                "cognito-idp:AdminDisableUser"
            ],
            "Resource": [
                "arn:aws:cognito-idp:us-east-1:AWSACCOUNTNUMBERHERE:COGNITOPOOLNAME"
            ],
            "Effect": "Allow"
        }
    ]
}
```

Call is DisableMusakBoxUsers.

Next, head on over to the Lambda console. 

Create a new function:
* Chooose "Author from scratch"
* Call it DisableMusakBoxUsers
* NodeJS runtime
* In permissions select use an existing role, select DisableMusakBoxUsers

In the code editor, add the function code:

```
const AWS = require('aws-sdk');

module.exports.handler = (e, ctx, cb) => {
  const cognito = new AWS.CognitoIdentityServiceProvider();
  cognito.adminDisableUser({ UserPoolId: e.userPoolId, Username: e.request.userAttributes.email })
    .promise()
    .then(() => {
        console.log("Disabling user: " + e.request.userAttributes.email)
      cb(null, e);
    });
};
```

Save it. 

Finally, we need to go to the Cognito console. Open up the user pool and head to Triggers. Select the `DisableMusakBoxUsers` lambda function.

Boom you're done. Double check to make sure that if you sign up a user they are disabled.

I manually enable users (this isn't a public service).

# Uploading music

You'll need to figure out what the Cognito identity id is for your user. To do that, head to the Cognito console, then go into Federated identities, then Identity Broswer to find your identity id.

Will look similar to this: `us-east-1:410bd4a7-4d8a-4016-9c18-2ef480a258b2`

To upload files, you can use the aws cli:
```
aws sync PATHTOYOURFILES s3://YOURBUCKETNAME/PRIVATE/COGNITOID/songs/
```

Once again, this assumes that you've organized your music with the artist's name as the parent folder. Ex:

```
ACDC/thunderstruck.mp3
Metallica/Nothing else matters.mp3
...and so on...
```

# Cost

Cost of this solution is driven by the following factors:
* S3 storage of music files
* S3 per-requests costs
* Data transfer from S3
* Cognito free for first 10k users... I only need 1.

Here's one cost scenario to give an idea of what costs will look like: 
* Assuming a music collection of 22 gigabytes (about 3400 files averaging about 6 Mb each). 
* If each file is about 5 minutes of runtime, that's about 288 songs in a 24 hour period assuming you had the music streaming 24/7.
* Let's further assume that you 10,000 list operations per month (listing artists/songs), and 8640 GET operations (retrieving songs)
* We use standard S3

Here's the cost break-down in US-EAST-1

Storage:

* 22 GB x 0.0230000000 USD = 0.51 USD (S3 Standard storage cost)
* 10,000 LIST requests per month x 0.000005 USD per request = 0.05 USD (S3 Standard LIST requests cost)
* 8,460 GET requests in a month x 0.0000004 USD per request = 0.0034 USD (S3 Standard GET requests cost)

S3 sub-total: 0.56$

Outbound data transfer:
* 288 (songs per day) * 5 Mb * 30 days = 43 Gb
* 1 GB x 0 USD per GB = 0.00 USD (first 1 GB free)
* 42 GB x 0.09 USD per GB = 3.69 USD

Data Transfer sub-total: 3.78 USD

Total: 4.34$/month 

That's for 24/7 streaming. If you stream an hour a day, the cost would probably be about 0.70$/month. Also caching will significantly reduce the costs.


-----

Notes:

Sending stuff to serviceworkers (and back!): https://googlechrome.github.io/samples/service-worker/post-message/
https://developers.google.com/web/tools/workbox/guides/advanced-recipes

Build MacOS Electron app: 

```
yarn build
```

