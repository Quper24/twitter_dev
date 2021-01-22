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
	constructor({
		            user,
		            listElem,
		            sortElem,
		            modalElems,
		            tweetElems,
		            classDeleteTweet,
		            classLikesTweet,
		            showUserPostElem,
		            showLikedPostElem
	            }) {
		const fetchData = new FetchData()
		this.user = user;
		this.sortDate = true;
		this.tweets = new Posts();
		this.elements = {
			listElem: document.querySelector(listElem),
			sortElem: document.querySelector(sortElem),
			showUserPostElem: document.querySelector(showUserPostElem),
			showLikedPostElem: document.querySelector(showLikedPostElem),
			modal: modalElems,
			tweetElems,
		};
		this.class = {
			classDeleteTweet,
			classLikesTweet
		};

		fetchData.getPost()
			.then(data => {
				data.forEach(this.tweets.addPost)
				this.showAllPost()
			});


		this.elements.modal.forEach(this.handlerModal, this);
		this.elements.tweetElems.forEach(this.addTweet, this);

		this.elements.listElem.addEventListener('click', this.deleteTweet);
		this.elements.listElem.addEventListener('click', this.likesTweet);

		this.elements.sortElem.addEventListener('click', this.changeSort);

		this.elements.showUserPostElem.addEventListener('click', this.showUserPost);
		this.elements.showLikedPostElem.addEventListener('click', this.showLikesPost);
	}

	renderPosts(posts) {
		const sortPost = posts.sort(this.sortField())

		this.elements.listElem.textContent = '';
		sortPost.forEach(({id, userName, nickname, text, img, likes, liked, getDate}) => {
			this.elements.listElem.insertAdjacentHTML('beforeend', `
                <li>
                    <article class="tweet">
                        <div class="row">
                            <img class="avatar" src="images/${nickname}.jpg" alt="Аватар пользователя ${nickname}">
                            <div class="tweet__wrapper">
                                <header class="tweet__header">
                                    <h3 class="tweet-author">${userName}
                                        <span class="tweet-author__add tweet-author__nickname">@${nickname}</span>
                                        <time class="tweet-author__add tweet__date">${getDate()}</time>
                                    </h3>
                                    <button class="tweet__delete-button chest-icon" data-id="${id}"></button>
                                </header>
                                <div class="tweet-post">
                                    <p class="tweet-post__text">${text}</p>
                                    ${
				img ?
					`<figure class="tweet-post__image">
                                            <img src="${img}" alt="илюстрация из поста ${nickname}">
                                        </figure>` :
					''
			}
                                    
                                </div>
                            </div>
                        </div>
                        <footer>
                            <button class="tweet__like ${liked ? this.class.classLikesTweet.active : ''}" data-id="${id}">
                                ${likes}
                            </button>
                        </footer>
                    </article>
                </li>
            `);
		})

	}

	changeSort = () => {
		this.sortDate = !this.sortDate;
		this.showAllPost();
	}

	showUserPost= () => {
		const posts = this.tweets.posts.filter(item => item.nickname === this.user.nick)
		this.renderPosts(posts)
	}

	showLikesPost= () => {
		const posts = this.tweets.posts.filter(item => item.liked)
		this.renderPosts(posts)
	}

	showAllPost() {
		this.renderPosts(this.tweets.posts)
	}

	handlerModal({button, modal, overlay, close}) {
		const buttonElem = document.querySelector(button);
		const modalElem = document.querySelector(modal);
		const overlayElem = document.querySelector(overlay);
		const closeElem = document.querySelector(close);

		const openModal = () => {
			modalElem.style.display = 'block';
		}

		const closeModal = (elem, event) => {
			const target = event.target;
			if (target === elem) {
				modalElem.style.display = 'none';
			}
		}

		buttonElem.addEventListener('click', openModal);

		if (closeElem) {
			closeElem.addEventListener('click', closeModal.bind(null, closeElem));
		}


		if (overlay) {
			overlayElem.addEventListener('click', closeModal.bind(null, overlayElem));
		}

		this.handlerModal.closeModal = () => {
			modalElem.style.display = 'none'
		}
	}


	addTweet({text, img, submit}) {
		const textElem = document.querySelector(text);
		const imgElem = document.querySelector(img);
		const submitElem = document.querySelector(submit);

		let imgUrl = '';
		let tempString = textElem.innerHTML;

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

		textElem.addEventListener('click', () => {
			if (textElem.innerHTML === tempString) {
				textElem.innerHTML = '';
			}
		})

		imgElem.addEventListener('click', () => {
			imgUrl = prompt('Введите адрес картинки!')
		})
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
}

class Posts {
	constructor({posts = []} = {}) {
		this.posts = posts;
	}

	addPost = tweets => {
		this.posts.push(new Post(tweets));
	}

	deletePost(id) {
		this.posts = this.posts.filter(item => item.id !== id);
	}

	likePost(id) {
		this.posts.forEach(item => {
			if (item.id === id) {
				item.changeLike()
			}
		});
	}
}


class Post {
	constructor({id, userName, nickname, postDate, text, img, likes = 0}) {
		this.id = id || this.generateID();
		this.userName = userName;
		this.nickname = nickname;
		this.postDate = postDate ? this.correctDate(postDate) : new Date();
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
		return Math.random().toString(32).substring(2, 9) + (+new Date).toString(32);
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

	correctDate(date) {
		if (isNaN(Date.parse(date))) {
			date = date.replace(/\./g, '/')
		}
		return new Date(date)
	}
}


const twitter = new Twitter({
	listElem: '.tweet-list',
	sortElem: '.header__link_sort',
	showUserPostElem: '.header__link_profile',
	showLikedPostElem: '.header__link_likes',
	user: {
		name: 'Максим',
		nick: 'dedmaks'
	},
	modalElems: [
		{
			button: '.header__link_tweet',
			modal: '.modal',
			overlay: '.overlay',
			close: '.modal-close__btn',
		}
	],
	tweetElems: [
		{
			text: '.modal .tweet-form__text',
			img: '.modal .tweet-img__btn',
			submit: '.modal .tweet-form__btn',
		},
		{
			text: '.tweet-form__text',
			img: '.tweet-img__btn',
			submit: '.tweet-form__btn',
		}
	],
	classDeleteTweet: 'tweet__delete-button',
	classLikesTweet: {
		like: 'tweet__like',
		active: 'tweet__like-active'
	},
})


