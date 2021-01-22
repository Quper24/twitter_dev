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
	constructor({listElem, classDeleteTweet, modalElem, tweetElem, classLikesTweet}) {
		const fetchData = new FetchData();
		this.posts = new Posts();
		this.classLikesTweet = classLikesTweet;
		this.sortDate = true;
		this.elements = {
			listElem: document.querySelector(listElem),
			modal: modalElem,
			tweetElem,

		}
		this.class = {
			classDeleteTweet,
			classLikesTweet
		}
		fetchData.getPosts()
			.then(data => {
				data.forEach(item => this.posts.addPost(item));
				this.showAllPost();
			});

		this.elements.modal.forEach(this.handlerModal, this);
		this.elements.tweetElem.forEach(this.addTweet, this);
		this.elements.listElem.addEventListener('click', this.deleteTweet);
		this.elements.listElem.addEventListener('click', this.likesTweet);

	}

	renderPosts(posts) {
		const tweets = posts.tweets.sort(this.sortField())
		this.elements.listElem.textContent = '';
		tweets.forEach(item => {
			const {
				id,
				userName,
				nickname,
				text,
				img,
				likes,
				liked
			} = item;
			this.elements.listElem.insertAdjacentHTML('beforeend', `
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
											<img src="${img}" alt="${text}">
										</figure>` :
				''}
								</div>
							</div>
						</div>
						<footer>
							<button class="tweet__like ${liked ? this.elements.classLikesTweet.active : ''}" data-key=${id}>
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
		this.renderPosts(this.posts)

	}

	showLikesPost() {
	}

	handlerModal({button, modal, overlay, close}) {
		const buttonElem = document.querySelector(button);
		const modalElem = document.querySelector(modal);
		const closeElem = document.querySelector(close);
		const overlayElem = document.querySelector((overlay));

		const openModal = () => {
			modalElem.style.display = 'block';
		};

		const closeModal = (elem, event) => {
			if (event.target === elem) {
				modalElem.style.display = 'none';
			}
		};

		buttonElem.addEventListener('click', openModal);

		if (closeElem) {
			closeElem.addEventListener('click', closeModal.bind(null, closeElem));
		}

		if (overlayElem) {
			overlayElem.addEventListener('click', closeModal.bind(null, overlayElem));
		}

		this.handlerModal.closeModal = () => {
			modalElem.style.display = 'none';
		};
	}

	addTweet({text, img, submit}) {

		const textElem = document.querySelector(text);
		const imgElem = document.querySelector(img);
		const submitElem = document.querySelector(submit);

		let imgURL = '';
		let tempString = textElem.innerHTML;

		textElem.addEventListener('click', () => {
			if (textElem.innerHTML === tempString) {
				textElem.innerHTML = ''
			}
		})

		imgElem.addEventListener('click', () => {
			imgURL = prompt('Введите url картинки')
		})

		submitElem.addEventListener('click', () => {
			console.log(this)
			this.posts.addPost({
				userName: 'Максим',
				nickname: 'maks',
				text: textElem.innerHTML,
				img: imgURL,
			})

			this.showAllPost();
			this.handlerModal.closeModal()
		})

	}

	sortField() {
		if (this.sortDate) {

			return (a, b) => {

				const dateA = new Date(a.postDate);
				const dateB = new Date(b.postDate)
				return dateB - dateA
			}
		} else {
			return (a, b) => b.likes - a.likes
		}

	}

	deleteTweet = e => {
		const target = e.target;
		if (target.classList.contains(this.class.classDeleteTweet)) {
			this.posts.deletePost(target.dataset.key);
			this.showAllPost()
		}
	}

	likesTweet = e => {
		const target = e.target;
		console.log(this)
		if (target.classList.contains(this.class.classLikesTweet.like)) {
			this.posts.likePost(target.dataset.key);
			target.classList.toggle(this.class.classLikesTweet.active)
			this.showAllPost()
		}
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

		this.tweets.forEach(item => {
			if (item.id === id) {
				item.changeLike()
			}
		});
	}

	deletePost(id) {
		this.tweets = this.tweets.filter(item => item.id !==id);
	}
}


class Post {
	constructor({id, userName, nickname, postDate = '', text, img = null, likes = 0,}) {
		this.id = id ? id : this.generateID();
		this.userName = userName;
		this.nickname = nickname;
		this.postDate = postDate ? new Date(postDate) : new Date();
		this.text = text;
		this.img = img;
		this.likes = likes;
		this.liked = false;
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
	modalElem: [{
		button: '.header__link_tweet',
		modal: '.modal',
		overlay: '.overlay',
		close: '.modal-close__btn',
	}],
	tweetElem: [
		{
			text: '.modal .tweet-form__text',
			img: '.modal .tweet-img__btn',
			submit: '.modal .tweet-form__btn',
		}

	],
	classDeleteTweet: 'tweet__delete-button',
	classLikesTweet: {
		like: 'tweet__like',
		active: 'tweet__like-active'
	},

})




