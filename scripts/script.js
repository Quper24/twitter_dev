class Twitter {
	constructor({selector}) {
		this.posts = [];
		this.sortDate = true;
		this.elements = {
			selector: document.querySelector(selector),
		}
	}
	renderPosts() {
	}
	changeSort() {
	}
	showUserPost() {
	}
	showAllPost() {
	}
	showLikesPost() {
	}
	openModal() {
	}
}

class Posts {
	constructor() {
		this.posts = []
	}

	addPost(obj) {
		const post = newPost(obj)

		this.posts.add(post);
	}

	likePost() {

	}

	deletePost() {
	}
}


class Post {
	constructor({user, data, text,  img = null, likes = 0,}) {
		this.id = this.generateID();
		this.userName = user.name;
		this.nickname = user.nickname
		this.postData = data;
		this.text = text;
		this.img = img;
		this.likes = likes;
		for (let i = 0; i < 100; i++){
			console.log(this.generateID())
		}
	}

	changeLike() {
		this.likes = !this.likes;
	}

	generateID() {
		return Math.random().toString(36).substr(2, 9) + (+new Date()).toString(32)
	}

}


new Post()