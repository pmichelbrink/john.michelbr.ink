var albumBucketName = 'www.john.michelbr.ink-images1';

// Initialize the Amazon Cognito credentials provider
AWS.config.region = 'us-east-1'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:f43c887e-4ef9-4b37-a607-996afe687b65',
});

// Create a new service object
var s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: {Bucket: albumBucketName}
});

// A utility function to create HTML.
function getHtml(template) {
  return template.join('\n');
}

// List the photo albums that exist in the bucket.
function listAlbums() {
  s3.listObjects({Delimiter: '/'}, function(err, data) {
    if (err) {
      return alert('There was an error listing your albums: ' + err.message);
    } else {
      var albums = data.CommonPrefixes.map(function(commonPrefix) {
        var prefix = commonPrefix.Prefix;
        var albumName = decodeURIComponent(prefix.replace('/', ''));
        return getHtml([
          '<li>',
            '<button style="margin:5px;" onclick="viewAlbum(\'' + albumName + '\')">',
              albumName,
            '</button>',
          '</li>'
        ]);
      });
      var message = albums.length ?
        getHtml([
          '<p>Click on an album name to view it.</p>',
        ]) :
        '<p>You do not have any albums. Please Create album.';
      var htmlTemplate = [
        '<h2>Albums</h2>',
        message,
        '<ul>',
          getHtml(albums),
        '</ul>',
      ]
      document.getElementById('viewer').innerHTML = getHtml(htmlTemplate);
    }
  });
}

// Show the photos that exist in an album.
function viewAlbum(albumName) {
  var albumPhotosKey = encodeURIComponent(albumName) + '/';
  s3.listObjects({Prefix: albumPhotosKey}, function(err, data) {
    if (err) {
      return alert('There was an error viewing your album: ' + err.message);
    }
    
    // 'this' references the AWS.Response instance that represents the response
    var href = this.request.httpRequest.endpoint.href;
    var bucketUrl = href + albumBucketName + '/';  

    data.Contents.shift();
    shuffleArray(data.Contents);
    
    var i = 0;
    var html = "";  

    data.Contents.forEach(photo => {
      var photoKey = photo.Key;
      var photoUrl = bucketUrl + encodeURIComponent(photoKey);

      //Only set the source on the first 13 images. The rest will get set (and downloaded) when scrolling
      if (i > 12)
        html += '<img class="picture" style=" width:25%; cursor:pointer; padding:10px" src="" data-src="' + photoUrl + '" onClick="showImage(\'' + photoUrl + '\')" role="button"/>';
      else
        html += '<img class="picture" style=" width:25%; cursor:pointer; padding:10px" src="' + photoUrl + '" onClick="showImage(\'' + photoUrl + '\')" role="button"/>';
      
      ++i;
    }); 

     var htmlTemplate = [
      '<div>',
        html,
        '<div id="myModal" class="modal">',
          '<span class="close">&times;</span>',
          '<img class="modal-content" id="img01">',
        '</div>',
        '<a href=mailto:paul@michelbr.ink?subject=John.Michelbrink>If you have any pictures that you would like to add, please email them to paul@michelbr.ink</a>',
      '</div>'
    ] 

     /* Code for non-lazy loading of images
      var photos = data.Contents.map(function(photo) {
      var photoKey = photo.Key;
      var photoUrl = bucketUrl + encodeURIComponent(photoKey);

      return getHtml([
        '<span>',
          '<div >',
            '<br/>',
            '<center>',
            '<img style=" max-width: 500px; cursor:pointer; padding:10px" src="' + photoUrl + '" onClick="showImage(\'' + photoUrl + '\')" role="button"/>',
            '</center>',
          '</div>',
        '</span>',
      ]);
    });

    var htmlTemplate = [
      '<div class="row">',
        getHtml(photos),
        '<div id="myModal" class="modal">',
          '<span class="close">&times;</span>',
          '<img class="modal-content" id="img01">',
        '</div>',
        '<a href=mailto:paul@michelbr.ink?subject=John.Michelbrink>If you have any pictures that you would like to add, please email them to paul@michelbr.ink</a>',
      '</div>',
    ]

    var htmlTemplate = [
      '<div class="row">',
        html,
      '</div>',
    ] */

    document.getElementById('viewer').innerHTML = getHtml(htmlTemplate);

    if (screen.width <= 699)
    {
      var btnOne = document.getElementById("btnOne");
      btnOne.click();
    }

  });
}
function shuffleArray(arr) {
  arr.sort(() => Math.random() - 0.5);
}