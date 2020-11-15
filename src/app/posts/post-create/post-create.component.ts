import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';

import { mimeType } from './mime-type.validator';

import { Post } from '../post.model';
import { PostsService } from './../posts.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css'],
})
export class PostCreateComponent implements OnInit, OnDestroy {
  enteredTitle = '';
  enteredContent = '';
  postForm: FormGroup;
  postToEdit: Post;
  isLoading = false;
  mode = 'create';
  imagePreview: string;
  private postId: string;
  private authStatusSub: Subscription;

  constructor(
    private postsService: PostsService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // For error handling
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(_ => {
      this.isLoading = false;
    });

    this.initForm();

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        this.postsService.getPost(this.postId).subscribe((post) => {
          this.isLoading = false;
          this.postToEdit = {
            id: post._id,
            title: post.title,
            content: post.content,
            imagePath: post.imagePath,
            creator: post.creator,
          };
          this.postForm.setValue({
            title: this.postToEdit.title,
            content: this.postToEdit.content,
            image: this.postToEdit.imagePath,
          });
        });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  initForm() {
    this.postForm = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      content: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType],
      }),
    });
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.postForm.patchValue({
      image: file,
    });
    this.postForm.updateValueAndValidity();

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onImageUrlChange() {
    this.postForm.updateValueAndValidity();
    this.imagePreview = this.postForm.get('image').value;
  }

  onSavePost() {
    if (this.postForm.invalid) {
      return;
    }
    this.isLoading = true;

    if (this.mode === 'create') {
      this.postsService
        .addPost(
          this.postForm.value.title,
          this.postForm.value.content,
          this.postForm.value.image
        )
        .then(() => {
          this.postForm.reset();
        });
    } else {
      this.postsService.updatePost(
        this.postId,
        this.postForm.value.title,
        this.postForm.value.content,
        this.postForm.value.image
      );
    }
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
