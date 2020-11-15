import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Post } from './post.model';
import { environment } from 'src/environments/environment';

const BACKEND_URL = environment.apiUrl + '/posts/';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[]; postCount: number }>();

  constructor(private http: HttpClient, private router: Router) {}

  getPostsUpdatedListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(postTitle: string, postContent: string, postImage: File | string) {
    const postData = new FormData();
    postData.append('title', postTitle);
    postData.append('content', postContent);
    // postData.append('image', postImage, postTitle);
    postData.append('image', postImage);

    return new Promise((resolve, reject) => {
      this.http
        .post<{ message: string; post: Post }>(
          BACKEND_URL,
          postData
        )
        .subscribe((responseData) => {
          // const post: Post = {
          //   id: responseData.post.id,
          //   title: postTitle,
          //   content: postContent,
          //   imagePath: responseData.post.imagePath
          // };
          // console.log(responseData.message);
          // this.posts.push(post);
          // this.emitPosts();
          resolve();
          this.router.navigate(['/']);
        });
    });
  }

  updatePost(
    postId: string,
    postTitle: string,
    postContent: string,
    image: File | string
  ) {
    let postData: Post | FormData;
    if (typeof image === 'object') {
      postData = new FormData();
      postData.append('id', postId);
      postData.append('title', postTitle);
      postData.append('content', postContent);
      postData.append('image', image);
    } else {
      postData = {
        id: postId,
        title: postTitle,
        content: postContent,
        imagePath: image,
        creator: null, // To prevent external manipulations
      };
    }
    this.http
      .put(`${BACKEND_URL}${postId}`, postData)
      .subscribe((newData) => {
        // console.log(newData);
        // const updatedPosts = [...this.posts];
        // const oldPostIndex = this.posts.findIndex(p => p.id === postId);
        // const post: Post = {
        //   id: postId,
        //   title: postTitle,
        //   content: postContent,
        //   imagePath: '' // Should fix ???
        // };
        // updatedPosts[oldPostIndex] = {...post};
        // this.posts = updatedPosts;
        // this.emitPosts();
        // console.log(this.posts[oldPostIndex]);
        this.router.navigate(['/']);
      });
  }

  getPost(postId: string) {
    // return {
    //   ... this.posts.find(post => post.id === postId)
    // };
    return this.http.get<{
      _id: string;
      title: string;
      content: string;
      imagePath: string;
      creator: string;
    }>(BACKEND_URL + postId);
  }

  getPosts(currentPage: number, postsPerPage: number) {
    const queryParams = `?page=${currentPage}&pagesize=${postsPerPage}`;
    this.http
      .get<{ message: string; posts: any; maxPosts: number }>(
        BACKEND_URL + queryParams
      )
      .pipe(
        map((postData) => {
          return {
            posts: postData.posts.map((post) => {
              return {
                id: post._id,
                title: post.title,
                content: post.content,
                imagePath: post.imagePath,
                creator: post.creator,
              };
            }),
            maxPosts: postData.maxPosts,
          };
        })
      )
      .subscribe((transformedPostsData) => {
        this.posts = transformedPostsData.posts;
        console.log(transformedPostsData.posts);
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: transformedPostsData.maxPosts,
        });
      });
  }

  deletePost(postId: string) {
    return this.http.delete(BACKEND_URL + postId);
    // .subscribe(
    //   (data: any) => {
    //     const updatedPosts = this.posts.filter(post => post.id !== postId);
    //     this.posts = updatedPosts;
    //     this.emitPosts();
    //     console.log(data.message);
    //   }
    // );
  }
}
