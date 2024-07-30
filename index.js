/**
 * @file Provides a custom element that mimics the HTML details element.
 * @author Daniel Blake
 * @version 0.0.1
 */


'use strict';

/**
 * Create all elements needed once.
 */
const div = document.createElement('div');
const span = document.createElement('span');
const style = document.createElement('style');
const slot = document.createElement('slot');
const svg = document.createElement('svg');


/**
 * Custom Accordion element.
 * 
 * Animated opening and closing actions of the accordion.
 */
class UIAccordion extends HTMLElement {
	#root = div.cloneNode();
	#details = div.cloneNode();
	#summary = div.cloneNode();
	#span = span.cloneNode();
	#styles = style.cloneNode();
	#slot = slot.cloneNode();
	#arrow = div.cloneNode();

	constructor() {
		super();

		this.#arrow.setAttribute('id', 'arrow');

		this.#details.setAttribute('id', 'details');
		this.#details.setAttribute('aria-hidden', 'true');
		this.#details.append(this.#slot);

		this.#summary.setAttribute('id', 'summary');
		this.#summary.setAttribute('role', 'button');
		this.#summary.setAttribute('aria-controls', 'details');
		this.#summary.append(this.#span);

		this.#root.setAttribute('id', 'root');
		this.#root.setAttribute('role', 'group');
		this.#root.setAttribute('aria-expanded', 'false');
		this.#root.append(this.#summary, this.#details);

		this.#styles.textContent = `
			:host {
			  --init-height: auto;
			  --full-height: 0;
			  all: initial;
			  display: flex;
				justify-content: space-between;
				border-block-end: 1px solid;
				contain: content;
				cursor: pointer;
				padding-inline: 1rem;
				padding-block-start: 1rem;
				position: relative;
			}
			
			::slotted(*) { 
				margin: 0; 
			}
			
			::slotted(p:not(:first-of-type)) {
			  margin-block-start: 1rem;
			}
			
			::slotted(*:last-of-type) { 
				padding-block-end: 1rem; 
			}
			
			#root {
			  flex: 1;
			}
			
			#summary {
			  padding-block-end: 1rem;
			}
			
			#arrow {
				inline-size: 10px;
				block-size: 10px;
				position: relative;
				inset-block-start: 0.2rem;
				border-block-end: 1px solid;
				border-inline-start: 1px solid;
				transform: rotate(-45deg);
				transform-origin: center;
				transition: transform 0.2s;
			}
			
			#details {
			  opacity: 0;
				block-size: var(--init-height);
				transition: all 0.2s;
				cursor: auto;
				inline-size: 100%;
			}
			
			:host([open]) #details {
			  opacity: 1;
				block-size: var(--full-height);
			}
			
			:host([open]) #arrow {
			  transform: rotate(135deg);
			}
			
			:host(:hover) #summary {
			  color: red;
			}
		`;

		this.attachShadow({ mode: 'open' }).append(
			this.#styles,
			this.#root,
			this.#arrow
		);

		this.addEventListener('click', function toggle() {
			if (this.hasAttribute('open')) {
				this.removeAttribute('open');
			} else {
				this.setAttribute('open', '');
			}
		});
		
		this.#details.addEventListener('click', e => void e.stopPropagation());
	}

	#setDefault(name, val) {
		if (typeof val === 'boolean') {
			if (!val) {
				this.removeAttribute(name);
			} else {
				this.setAttribute(name, '');
			}
		} else {
			if (!this.hasAttribute(name)) {
				this.setAttribute(name, val);
			}
		}
	}

	#lazyLoad(name) {
		if (this.hasOwnProperty(name)) {
			const value = this[name];

			delete this[name];
			this[name] = value;
		}
	}

	get summary() {
		if (this.hasAttribute('summary')) {
			return this.getAttribute('summary');
		}

		return '';
	}

	set summary(val) {
		if (val) {
			this.setAttribute('summary', val);
		}
	}

	get open() {
		return this.hasAttribute('open');
	}

	set open(val) {
		if (val) {
			this.setAttribute('open', '');
		} else {
			this.removeAttribute('open');
		}
	}

	connectedCallback() {
		const detailsRect = this.#details.getBoundingClientRect();
		this.#span.textContent = this.summary;
		
		this.#lazyLoad('summary');
		this.#lazyLoad('open');
		this.#setDefault('summary', '[Please add a summary here]');
		this.#setDefault('open', false);

		this.#details.style.setProperty('--init-height', '0px');
		this.#details.style.setProperty('--full-height', `${detailsRect.height}px`);
	}

	static get observedAttributes() {
		return ['open'];
	}

	attributeChangedCallback() {
		if (this.open) {
			this.#root.setAttribute('aria-expanded', 'true');
			this.#details.setAttribute('aria-hidden', 'false');
		} else {
			this.#root.setAttribute('aria-expanded', 'false');
			this.#details.setAttribute('aria-hidden', 'true');
		}
	}
}

window.customElements.define('ui-accordion', UIAccordion);
