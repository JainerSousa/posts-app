import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';

import { PostsService } from './../posts.service';
import { Post } from './../post.model';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  // posts = [
  //   { title: 'First Post', content: 'This is the fist post\'s content' },
  //   { title: 'Second Post', content: 'This is the second post\'s content' },
  //   { title: 'Third Post', content: 'This is the third post\'s content' }
  // ];
  posts: Post[] = [];
  isLoading = false;
  totalPosts = 10;
  postsPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  isAuthenticated: boolean;
  userId: string;
  authListenerSubscription: Subscription;
  private postsSubscription: Subscription;

  constructor(private postsService: PostsService, private authService: AuthService) { }

  ngOnInit() {
    this.isLoading = true;
    this.postsService.getPosts(this.currentPage, this.postsPerPage);
    this.userId = this.authService.getUserId()
    this.postsSubscription = this.postsService.getPostsUpdatedListener()
      .subscribe(
        (postsData: { posts: Post[], postCount: number }) => {
          this.isLoading = false;
          this.posts = postsData.posts;
          this.totalPosts = postsData.postCount;
        }
      );

    this.isAuthenticated = this.authService.getIsAuth();
    this.authListenerSubscription = this.authService.getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.isAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
  }

  ngOnDestroy() {
    this.postsSubscription.unsubscribe();
    this.authListenerSubscription.unsubscribe();
  }

  onPageChanged(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.currentPage, this.postsPerPage);
  }

  onDelete(postId: string) {
    this.isLoading = true;
    this.postsService.deletePost(postId)
      .subscribe(
        (data: any) => {
          console.log(data.message);
          this.postsService.getPosts(this.currentPage, this.postsPerPage);
        },
        () => {
          this.isLoading = false;
        }
      );
  }
}
