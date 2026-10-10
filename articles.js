const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/articles (Searchable and filterable)
router.get('/', (req, res) => {
  try {
    const { category, search } = req.query;
    let articles = db.getTable('health_articles') || [];

    // Filter published only unless admin
    articles = articles.filter(a => a.is_published !== 0);

    if (category && category !== 'All') {
      articles = articles.filter(a => a.category.toLowerCase() === category.toLowerCase());
    }

    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      articles = articles.filter(a => 
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        (a.content && a.content.toLowerCase().includes(q))
      );
    }

    res.json({
      success: true,
      data: articles.map(a => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        category: a.category,
        description: a.description,
        image_url: a.image_url,
        read_time_mins: a.read_time_mins,
        author: a.author,
        created_at: a.created_at
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not fetch articles.' });
  }
});

// GET /api/articles/:slug
router.get('/:slug', (req, res) => {
  try {
    const article = db.findOne('health_articles', a => a.slug === req.params.slug);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }

    res.json({ success: true, data: article });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not load article.' });
  }
});

// POST /api/articles (Admin)
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { title, category, description, content, image_url, references_sources, read_time_mins } = req.body;

    if (!title || !category || !description || !content) {
      return res.status(400).json({ success: false, message: 'Title, category, description, and content are required.' });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

    const article = db.insert('health_articles', {
      title: title.trim(),
      slug,
      category,
      description: description.trim(),
      content: content.trim(),
      image_url: image_url || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80',
      references_sources: references_sources || 'DigiPulse Clinical Guidelines',
      read_time_mins: Number(read_time_mins) || 4,
      author: req.user.fullName || 'DigiPulse Medical Editorial Board',
      is_published: 1
    });

    res.status(201).json({ success: true, message: 'Article published successfully.', data: article });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not publish article.' });
  }
});

// PUT /api/articles/:id (Admin)
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = db.findOne('health_articles', a => a.id === id);
    if (!existing) return res.status(404).json({ success: false, message: 'Article not found.' });

    const updated = db.update('health_articles', id, req.body);
    res.json({ success: true, message: 'Article updated successfully.', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not update article.' });
  }
});

// DELETE /api/articles/:id (Admin)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = db.findOne('health_articles', a => a.id === id);
    if (!existing) return res.status(404).json({ success: false, message: 'Article not found.' });

    db.delete('health_articles', id);
    res.json({ success: true, message: 'Article deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not delete article.' });
  }
});

module.exports = router;
