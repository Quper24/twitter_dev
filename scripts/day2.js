class FetchData {
	getResource = async url => {
		const res = await fetch(url);
		if (!res.ok) {
			throw new Error(`Произошла ошибка ${res.status}`)
		}
		return await res.json();
	};

	getPosts = async () => {
		return await this.getResource('db/dataBase.json');
	};

}

class Twitter {
	constructor({listElem}) {
		const fetchData = new FetchData();
		this.posts = new Posts();
		this.sortDate = true;
		this.elements = {
			listElem: document.querySelector(listElem),
		}
		fetchData.getPosts()
			.then(data => {
				data.forEach(item => this.posts.addPost(item));
				this.renderPosts();
			})


	}
	renderPosts() {
		this.elements.listElem.textContent = '';
		this.posts.tweets.forEach(({
			id,
			userName,
			nickname,
			text,
			img,
			likes
		}) => {
			
			this.elements.listElem.insertAdjacentHTML('beforeend' ,`
				<li>
					<article class="tweet">
						<div class="row">
							<img class="avatar" src="images/${nickname}.jpg" alt="Аватар пользователя ${userName}">
							<div class="tweet__wrapper">
								<header class="tweet__header">
									<h3 class="tweet-author">${userName}
										<span class="tweet-author__add tweet-author__nickname">@${nickname}</span>
										<time class="tweet-author__add tweet__date">${item.getDate()}</time>
									</h3>
									<button class="tweet__delete-button chest-icon" data-key=${id}></button>
								</header>
								<div class="tweet-post">
									<p class="tweet-post__text">${text}</p>
									${img ?
										`<figure class="tweet-post__image">
											<img src="${img}">
										</figure>` :
										''}
								</div>
							</div>
						</div>
						<footer>
							<button class="tweet__like">
								${likes}
							</button>
						</footer>
					</article>
				</li>
			`)

		})
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
	constructor(posts = []) {
		this.tweets = posts;
	}

	addPost(obj) {
		const post = new Post(obj)

		this.tweets.push(post);
	}

	likePost(id) {
	}

	deletePost(id) {
	}
}


class Post {
	constructor({id, userName, nickname, postDate = '', text,  img = null, likes = 0,}) {
		this.id = id ? id : this.generateID();
		this.userName = userName;
		this.nickname = nickname;
		this.postDate = postDate ? new Date(postDate) : new Date();
		this.text = text;
		this.img = img;
		this.likes = likes;
	}

	changeLike() {
		this.liked = !this.liked;
        if (this.liked) {
            this.likes++;
        } else {
            this.likes--;
        }
	}

	generateID() {
		return Math.random().toString(36).substr(2, 9) + (+new Date()).toString(32)
	}

	getDate() {
		const options = {
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		};
		return this.postDate.toLocaleString('ru-RU', options);
	}

}


new Twitter({
	listElem: '.tweet-list',
})