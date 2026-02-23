// Personal Blog Engine - Full SPA with Admin
class BlogEngine {
    constructor() {
        this.posts = [];
        this.currentView = 'home';
        this.editingPostId = null;
        this.loadPosts();
        this.initMarked();
        this.render();
        this.setupRouter();
    }

    initMarked() {
        marked.setOptions({
            breaks: true,
            gfm: true,
            highlight: function(code, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(code, { language: lang }).value;
                    } catch (e) {}
                }
                return hljs.highlightAuto(code).value;
            }
        });
    }

    loadPosts() {
        const stored = localStorage.getItem('blog_posts');
        if (stored) {
            this.posts = JSON.parse(stored);
        } else {
            // Seed with sample posts
            this.posts = [
                {
                    id: '1',
                    title: 'Welcome to My Blog',
                    slug: 'welcome',
                    excerpt: 'This is my first blog post using the Personal Blog Engine. A simple, elegant blogging platform built with vanilla JavaScript and Tailwind CSS.',
                    content: `# Welcome! 🎉

This is my **first** blog post using the Personal Blog Engine.

## Features

- Markdown support
- Admin panel
- Responsive design
- No backend required

> "Simplicity is the ultimate sophistication." - Leonardo da Vinci

\`\`\`javascript
console.log('Hello, world!');
\`\`\`

Stay tuned for more posts!`,
                    tags: ['intro', 'blog'],
                    date: new Date().toISOString(),
                    published: true
                },
                {
                    id: '2',
                    title: 'Getting Started with Go',
                    slug: 'getting-started-with-go',
                    excerpt: 'Learn the basics of Go programming language. From installation to writing your first program.',
                    content: `# Getting Started with Go

Go is an open-source programming language that makes it simple to build secure, scalable systems.

## Installation

Download from [golang.org](https://golang.org).

## Hello World

\`\`\`go
package main

import "fmt"

func main() {
    fmt.Println("Hello, Go!")
}
\`\`\`

## Why Go?

- Fast compilation
- Garbage collection
- Simple syntax
- Great concurrency support`,
                    tags: ['go', 'programming', 'tutorial'],
                    date: new Date().toISOString(),
                    published: true
                }
            ];
            this.savePosts();
        }
    }

    savePosts() {
        localStorage.setItem('blog_posts', JSON.stringify(this.posts));
    }

    setupRouter() {
        window.addEventListener('popstate', () => this.handleRoute());
        this.handleRoute(); // Initial route
    }

    handleRoute() {
        const hash = window.location.hash.slice(1) || 'home';
        const [view, param] = hash.split('/');
        this.currentView = view;
        
        if (view === 'post' && param) {
            this.renderPost(param);
        } else if (view === 'about') {
            this.renderAbout();
        } else {
            this.renderHome();
        }
        
        // Close mobile menu
        document.getElementById('mobile-menu')?.classList.add('hidden');
    }

    router(view, param = null) {
        window.location.hash = param ? `${view}/${param}` : view;
    }

    render() {
        // Initial render
        this.handleRoute();
    }

    renderHome() {
        const app = document.getElementById('app');
        const publishedPosts = this.posts.filter(p => p.published).sort((a,b) => new Date(b.date) - new Date(a.date));
        
        app.innerHTML = `
            <!-- Hero -->
            <section class="text-center py-12 mb-8">
                <h1 class="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    My Blog
                </h1>
                <p class="text-gray-400 max-w-2xl mx-auto">
                    Thoughts on software engineering, distributed systems, and AI.
                </p>
            </section>

            <!-- Posts Grid -->
            <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                ${publishedPosts.map(post => this.createPostCard(post)).join('')}
            </section>

            ${publishedPosts.length === 0 ? `
                <div class="text-center py-12 text-gray-500">
                    <i class="fas fa-newspaper text-6xl mb-4"></i>
                    <p>No posts yet.</p>
                </div>
            ` : ''}
        `;
    }

    createPostCard(post) {
        const date = new Date(post.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
        return `
            <article class="post-card bg-gray-800 rounded-lg overflow-hidden border border-gray-700 flex flex-col">
                <div class="p-6 flex-1 flex flex-col">
                    <div class="text-sm text-blue-400 mb-2">${date}</div>
                    <h2 class="text-xl font-bold mb-3">
                        <a href="#post/${post.slug}" class="hover:text-blue-400 transition" onclick="blog.router('post', '${post.slug}'); return false;">
                            ${post.title}
                        </a>
                    </h2>
                    <p class="text-gray-400 mb-4 flex-1">${post.excerpt}</p>
                    <div class="flex flex-wrap gap-2 mb-4">
                        ${post.tags.map(tag => `<span class="px-2 py-1 bg-gray-700 text-xs rounded text-gray-300">#${tag}</span>`).join('')}
                    </div>
                    <a href="#post/${post.slug}" class="text-blue-400 hover:underline text-sm font-medium" onclick="blog.router('post', '${post.slug}'); return false;">
                        Read more →
                    </a>
                </div>
            </article>
        `;
    }

    renderPost(slug) {
        const post = this.posts.find(p => p.slug === slug);
        if (!post) {
            this.render404();
            return;
        }
        
        const date = new Date(post.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
        const html = marked.parse(post.content);
        
        document.getElementById('app').innerHTML = `
            <article class="max-w-3xl mx-auto">
                <button onclick="blog.router('home')" class="mb-6 text-gray-400 hover:text-white transition">
                    <i class="fas fa-arrow-left mr-2"></i> Back to Home
                </button>
                <header class="mb-8">
                    <h1 class="text-3xl md:text-4xl font-bold mb-4">${post.title}</h1>
                    <div class="text-gray-400 mb-4">
                        <span>${date}</span>
                        ${post.tags.length ? `<span class="mx-2">•</span><span>${post.tags.join(', ')}</span>` : ''}
                    </div>
                </header>
                <div class="markdown-body bg-gray-800 p-8 rounded-lg border border-gray-700">
                    ${html}
                </div>
                <footer class="mt-8 pt-6 border-t border-gray-700">
                    <button onclick="blog.router('home')" class="text-blue-400 hover:underline">
                        ← Back to all posts
                    </button>
                </footer>
            </article>
        `;
    }

    renderAbout() {
        document.getElementById('app').innerHTML = `
            <div class="max-w-2xl mx-auto text-center py-12">
                <i class="fas fa-user-circle text-8xl text-blue-500 mb-6"></i>
                <h1 class="text-3xl font-bold mb-4">About This Blog</h1>
                <p class="text-gray-300 mb-6">
                    This blog is powered by a custom-built static blog engine using vanilla JavaScript, Tailwind CSS, and localStorage.
                    It demonstrates how to create a fully functional blogging platform without any backend.
                </p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    <div class="bg-gray-800 p-6 rounded-lg border border-gray-700">
                        <i class="fas fa-pen-nib text-3xl text-blue-400 mb-4"></i>
                        <h3 class="font-semibold mb-2">Markdown</h3>
                        <p class="text-sm text-gray-400">Write posts in Markdown with syntax highlighting.</p>
                    </div>
                    <div class="bg-gray-800 p-6 rounded-lg border border-gray-700">
                        <i class="fas fa-shield-alt text-3xl text-green-400 mb-4"></i>
                        <h3 class="font-semibold mb-2">Admin Panel</h3>
                        <p class="text-sm text-gray-400">Create, edit, and delete posts easily.</p>
                    </div>
                    <div class="bg-gray-800 p-6 rounded-lg border border-gray-700">
                        <i class="fas fa-mobile-alt text-3xl text-purple-400 mb-4"></i>
                        <h3 class="font-semibold mb-2">Responsive</h3>
                        <p class="text-sm text-gray-400">Looks great on all devices.</p>
                    </div>
                </div>
            </div>
        `;
    }

    render404() {
        document.getElementById('app').innerHTML = `
            <div class="text-center py-20">
                <h1 class="text-6xl font-bold text-gray-600 mb-4">404</h1>
                <p class="text-gray-400 mb-6">Post not found</p>
                <button onclick="blog.router('home')" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded font-medium transition">
                    Go Home
                </button>
            </div>
        `;
    }

    // Admin functions
    toggleAdmin() {
        const panel = document.getElementById('admin-panel');
        const overlay = document.getElementById('admin-overlay');
        panel.classList.toggle('open');
        overlay.classList.toggle('open');
        if (panel.classList.contains('open')) {
            this.renderAdminPosts();
        }
    }

    renderAdminPosts() {
        const list = document.getElementById('posts-list-admin');
        list.innerHTML = this.posts.map(post => `
            <div class="bg-gray-700 p-4 rounded flex justify-between items-center">
                <div>
                    <div class="font-medium">${post.title}</div>
                    <div class="text-xs text-gray-400">Slug: ${post.slug}</div>
                </div>
                <button onclick="blog.editPost('${post.id}')" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm">
                    Edit
                </button>
            </div>
        `).join('');
    }

    openPostEditor() {
        document.getElementById('post-editor').classList.remove('hidden');
        this.editingPostId = null;
        document.getElementById('editor-title').value = '';
        document.getElementById('editor-slug').value = '';
        document.getElementById('editor-excerpt').value = '';
        document.getElementById('editor-content').value = '';
        document.getElementById('editor-tags').value = '';
        document.getElementById('btn-delete-post').classList.add('hidden');
    }

    editPost(id) {
        const post = this.posts.find(p => p.id === id);
        if (!post) return;
        
        this.editingPostId = id;
        document.getElementById('editor-title').value = post.title;
        document.getElementById('editor-slug').value = post.slug;
        document.getElementById('editor-excerpt').value = post.excerpt;
        document.getElementById('editor-content').value = post.content;
        document.getElementById('editor-tags').value = post.tags.join(', ');
        document.getElementById('btn-delete-post').classList.remove('hidden');
        document.getElementById('post-editor').classList.remove('hidden');
    }

    closePostEditor() {
        document.getElementById('post-editor').classList.add('hidden');
        this.editingPostId = null;
    }

    savePost() {
        const title = document.getElementById('editor-title').value.trim();
        const slug = document.getElementById('editor-slug').value.trim() || this.slugify(title);
        const excerpt = document.getElementById('editor-excerpt').value.trim();
        const content = document.getElementById('editor-content').value.trim();
        const tags = document.getElementById('editor-tags').value.split(',').map(t => t.trim()).filter(Boolean);
        
        if (!title || !content) {
            alert('Title and content are required!');
            return;
        }
        
        if (this.editingPostId) {
            // Update
            const post = this.posts.find(p => p.id === this.editingPostId);
            if (post) {
                post.title = title;
                post.slug = slug;
                post.excerpt = excerpt || this.truncate(content, 150);
                post.content = content;
                post.tags = tags;
            }
        } else {
            // Create
            const newPost = {
                id: Date.now().toString(),
                title,
                slug,
                excerpt: excerpt || this.truncate(content, 150),
                content,
                tags,
                date: new Date().toISOString(),
                published: true
            };
            this.posts.unshift(newPost);
        }
        
        this.savePosts();
        this.renderAdminPosts();
        this.closePostEditor();
        this.renderHome();
    }

    deleteCurrentPost() {
        if (!this.editingPostId) return;
        if (confirm('Delete this post?')) {
            this.posts = this.posts.filter(p => p.id !== this.editingPostId);
            this.savePosts();
            this.renderAdminPosts();
            this.closePostEditor();
            this.renderHome();
        }
    }

    slugify(text) {
        return text.toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }

    truncate(text, length) {
        if (text.length <= length) return text;
        return text.substring(0, length).replace(/\s+\S*$/, '') + '...';
    }
}

// Initialize
let blog;
document.addEventListener('DOMContentLoaded', () => {
    blog = new BlogEngine();
});
