const Post = require('../models/post');

exports.createPost = (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  console.log(req.userData);
  if (req.file) {
    imagePath = url + '/images/' + req.file.filename;
  } else {
    imagePath = req.body.image;
  }
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    creator: req.userData.userId,
    imagePath,
  });
  post
    .save()
    .then((createdPost) => {
      res.status(201).json({
        // Everything ok, new ressource created!
        message: 'Post added successfully!',
        post: {
          ...createdPost,
          id: createdPost._id,
        },
      });
    })
    .catch((error) => {
      res.status(500).json({ message: 'Creating a post failed!' });
    });
};

exports.updatePost = (req, res, next) => {
  let newImagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + '://' + req.get('host');
    newImagePath = url + '/images/' + req.file.filename;
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: newImagePath,
  });
  Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post)
    .then((result) => {
      if (result.n > 0) {
        res.status(200).json({
          message: 'Post updated succesfully!',
        });
      } else {
        res.status(401).json({
          message: 'Not authorized!',
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ message: "Couldn't update post!" });
    });
};

exports.getPosts = (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  postQuery
    .then((documents) => {
      fetchedPosts = documents;
      return Post.countDocuments();
    })
    .then((count) => {
      res.status(200).json({
        // Everything ok
        message: 'Posts fetched successfully!',
        posts: fetchedPosts,
        maxPosts: count,
      });
    })
    .catch((error) => {
      res.status(500).json({ message: 'Fetching posts failed!' });
    });
};

exports.getPost = (req, res, next) => {
  Post.findById(req.params.id)
    .then((document) => {
      if (document) {
        res.status(200).json(document);
      } else {
        res.status(404).json({
          message: 'Post not found',
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ message: 'Fetching post failed!' });
    });
};

exports.deletePost = (req, res, next) => {
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId })
    .then((result) => {
      if (result.n > 0) {
        res.status(200).json({
          message: 'Deletion succesfully!',
        });
      } else {
        res.status(401).json({
          message: 'Not authorized!',
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ message: 'Delete post failed!' });
    });
  // .then(() => {
  //   return Post.countDocuments();
  // })
  // .then((count) => {
  //   res.status(200).json({
  //     message: 'Post deleted!',
  //     maxPosts: count,
  //   });
  // });
};
