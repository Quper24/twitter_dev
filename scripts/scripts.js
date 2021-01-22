class FetchData {
	getResourse = async url => {
		const res = await fetch(url);

		if (!res.ok) {
			throw new Error('Произошла ошибка: ' + res.status)
		}

		return res.json();
	}

	getPost = () => this.getResourse('db/dataBase.json');
}


class Twitter {
	constructor({user, listElem, classDeleteTweet, modalElem, tweetElem, classLikesTweet}) {
		const fetchData = new FetchData();
		this.user = user;
		this.tweets = new Posts();
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

		fetchData.getPost()
			.then(data => {
				data.forEach(this.tweets.addPost)
				this.showAllPost()
			});

		this.elements.modal.forEach(this.handlerModal, this);
		this.elements.tweetElem.forEach(this.addTweet, this);

		this.elements.listElem.addEventListener('click', this.deleteTweet);
		this.elements.listElem.addEventListener('click', this.likesTweet);

	}

	renderPosts(posts) {
		const sortPost = posts.sort(this.sortField())
		this.elements.listElem.textContent = '';
		sortPost.forEach(item => {
			const {
				id,
				userName,
				nickname,
				text,
				img,
				likes,
				liked,
				getDate
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
										<time class="tweet-author__add tweet__date">${getDate()}</time>
									</h3>
									<button class="tweet__delete-button chest-icon" data-id=${id}></button>
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
							<button class="tweet__like ${liked ? this.elements.classLikesTweet.active : ''}" data-id=${id}>
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

	showLikesPost() {
	}

	showAllPost() {
		this.renderPosts(this.tweets.posts)
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
			const target  = event.target;
			if (target === elem) {
				modalElem.style.display = 'none';
			}
		}

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
			this.tweets.addPost({
				userName: this.user.name,
				nickname: this.user.nick,
				text: textElem.innerHTML,
				img: imgUrl
			})
			this.showAllPost();
			this.handlerModal.closeModal();
			textElem.innerHTML = tempString;
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
			this.tweets.deletePost(target.dataset.id);
			this.showAllPost()
		}
	}

	likesTweet = e => {
		const target = e.target;
		if (target.classList.contains(this.class.classLikesTweet.like)) {
			this.tweets.likePost(target.dataset.id);
			target.classList.toggle(this.class.classLikesTweet.active)
			this.showAllPost()
		}
	}
}

class Posts {
	constructor(posts = []) {
		this.posts = posts;
	}

	addPost = tweets => {
		this.posts.push(new Post(tweets));
	}

	likePost(id) {

		this.posts.forEach(item => {
			if (item.id === id) {
				item.changeLike()
			}
		});
	}

	deletePost(id) {
		this.posts = this.posts.filter(item => item.id !==id);
	}
}


class Post {
	constructor({id, userName, nickname, postDate, text, img = null, likes = 0,}) {
		this.id = id || this.generateID();
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

	getDate = () => {

		const options = {
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		};

		return this.postDate.toLocaleString('ru-RU', options)
	}

}


new Twitter({
	listElem: '.tweet-list',
	user: {
		name: 'Максим',
		nick: 'dedmaks'
	},
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




