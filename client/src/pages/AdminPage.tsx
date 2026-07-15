import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentApi, adminApi } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import type { Category, Flashcard } from '../types';

export default function AdminPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'categories' | 'flashcards'>('categories');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Queries
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => contentApi.categories().then((r) => r.data as Category[]),
  });

  const { data: flashcards } = useQuery({
    queryKey: ['flashcards'],
    queryFn: () => contentApi.flashcards().then((r) => r.data as Flashcard[]),
  });

  // Mutations for Category
  const createCategoryMutation = useMutation({
    mutationFn: (data: unknown) => adminApi.createCategory(data),
    onSuccess: () => {
      setMessage({ type: 'success', text: 'Category created successfully!' });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      resetCatForm();
    },
    onError: (err: any) => setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to create category' }),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: (data: { id: string; payload: unknown }) => adminApi.updateCategory(data.id, data.payload),
    onSuccess: () => {
      setMessage({ type: 'success', text: 'Category updated successfully!' });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      resetCatForm();
    },
    onError: (err: any) => setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update category' }),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteCategory(id),
    onSuccess: () => {
      setMessage({ type: 'success', text: 'Category deleted!' });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  // Mutations for Flashcard
  const createFlashcardMutation = useMutation({
    mutationFn: (data: unknown) => adminApi.createFlashcard(data),
    onSuccess: () => {
      setMessage({ type: 'success', text: 'Flashcard created successfully!' });
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
      resetFcForm();
    },
    onError: (err: any) => setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to create flashcard' }),
  });

  const updateFlashcardMutation = useMutation({
    mutationFn: (data: { id: string; payload: unknown }) => adminApi.updateFlashcard(data.id, data.payload),
    onSuccess: () => {
      setMessage({ type: 'success', text: 'Flashcard updated successfully!' });
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
      resetFcForm();
    },
    onError: (err: any) => setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update flashcard' }),
  });

  const deleteFlashcardMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteFlashcard(id),
    onSuccess: () => {
      setMessage({ type: 'success', text: 'Flashcard deleted!' });
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    },
  });

  // Category Form State
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catIcon, setCatIcon] = useState('🌟');
  const [catColor, setCatColor] = useState('#6366f1');

  const resetCatForm = () => {
    setEditingCatId(null);
    setCatName('');
    setCatSlug('');
    setCatIcon('🌟');
    setCatColor('#6366f1');
  };

  const handleEditCat = (cat: Category) => {
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatIcon(cat.icon || '🌟');
    setCatColor(cat.color || '#6366f1');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: catName, slug: catSlug, icon: catIcon, color: catColor };
    if (editingCatId) {
      updateCategoryMutation.mutate({ id: editingCatId, payload });
    } else {
      createCategoryMutation.mutate({ ...payload, sortOrder: (categories?.length || 0) + 1 });
    }
  };

  // Flashcard Form State
  const [editingFcId, setEditingFcId] = useState<string | null>(null);
  const [fcWord, setFcWord] = useState('');
  const [fcTranslation, setFcTranslation] = useState('');
  const [fcPronunciation, setFcPronunciation] = useState('');
  const [fcImage, setFcImage] = useState('🖼️');
  const [fcDifficulty, setFcDifficulty] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('BEGINNER');
  const [fcCategory, setFcCategory] = useState('');

  const resetFcForm = () => {
    setEditingFcId(null);
    setFcWord('');
    setFcTranslation('');
    setFcPronunciation('');
    setFcImage('🖼️');
    setFcDifficulty('BEGINNER');
  };

  const handleEditFc = (fc: Flashcard) => {
    setEditingFcId(fc.id);
    setFcWord(fc.word);
    setFcTranslation(fc.translation);
    setFcPronunciation(fc.pronunciation || '');
    setFcImage(fc.imageUrl || '🖼️');
    setFcDifficulty(fc.difficulty);
    setFcCategory(fc.categoryId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveFlashcard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fcCategory) return setMessage({ type: 'error', text: 'Select a category' });
    const payload = {
      word: fcWord,
      translation: fcTranslation,
      pronunciation: fcPronunciation || undefined,
      imageUrl: fcImage || undefined,
      difficulty: fcDifficulty,
      categoryId: fcCategory,
      tags: [categories?.find((c) => c.id === fcCategory)?.slug].filter(Boolean),
    };
    if (editingFcId) {
      updateFlashcardMutation.mutate({ id: editingFcId, payload });
    } else {
      createFlashcardMutation.mutate(payload);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p>You must be an administrator to view this page.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-primary-800 mb-6">Admin Dashboard 🛠️</h1>

      {message && (
        <div className={`mb-6 p-4 rounded-xl text-center font-bold ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-4 mb-8 border-b pb-2">
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 font-bold rounded-t-lg ${activeTab === 'categories' ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-700'}`}
        >
          Categories
        </button>
        <button
          onClick={() => setActiveTab('flashcards')}
          className={`px-4 py-2 font-bold rounded-t-lg ${activeTab === 'flashcards' ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-700'}`}
        >
          Flashcards
        </button>
      </div>

      {activeTab === 'categories' && (
        <div className="space-y-8">
          <div className="game-card">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">{editingCatId ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input type="text" value={catName} onChange={(e) => setCatName(e.target.value)} required className="input-field" placeholder="e.g. Sports" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Slug</label>
                  <input type="text" value={catSlug} onChange={(e) => setCatSlug(e.target.value)} required className="input-field" placeholder="e.g. sports" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Icon (Emoji)</label>
                  <input type="text" value={catIcon} onChange={(e) => setCatIcon(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Color (Hex)</label>
                  <input type="text" value={catColor} onChange={(e) => setCatColor(e.target.value)} className="input-field" />
                </div>
              </div>
              <div className="flex gap-4">
                <button type="submit" disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending} className="btn-primary flex-1">
                  {editingCatId ? 'Update Category' : 'Create Category'}
                </button>
                {editingCatId && (
                  <button type="button" onClick={resetCatForm} className="px-6 py-3 rounded-xl bg-slate-200 font-bold hover:bg-slate-300">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="game-card">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Existing Categories</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-2">Icon</th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Slug</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories?.map((cat) => (
                    <tr key={cat.id} className="border-b hover:bg-slate-50">
                      <td className="p-2 text-2xl">{cat.icon}</td>
                      <td className="p-2 font-bold" style={{ color: cat.color }}>{cat.name}</td>
                      <td className="p-2 text-slate-500">{cat.slug}</td>
                      <td className="p-2 space-x-2">
                        <button onClick={() => handleEditCat(cat)} className="text-blue-600 hover:underline">Edit</button>
                        <button onClick={() => { if(confirm('Are you sure?')) deleteCategoryMutation.mutate(cat.id); }} className="text-red-600 hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {categories?.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-slate-500">No categories found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'flashcards' && (
        <div className="space-y-8">
          <div className="game-card">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">{editingFcId ? 'Edit Flashcard' : 'Add Flashcard'}</h2>
            <form onSubmit={handleSaveFlashcard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select value={fcCategory} onChange={(e) => setFcCategory(e.target.value)} required className="input-field">
                  <option value="">-- Select Category --</option>
                  {categories?.map((c) => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Word</label>
                  <input type="text" value={fcWord} onChange={(e) => setFcWord(e.target.value)} required className="input-field" placeholder="e.g. Football" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Translation</label>
                  <input type="text" value={fcTranslation} onChange={(e) => setFcTranslation(e.target.value)} required className="input-field" placeholder="e.g. Futbol" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Pronunciation</label>
                  <input type="text" value={fcPronunciation} onChange={(e) => setFcPronunciation(e.target.value)} className="input-field" placeholder="e.g. /ˈfʊtbɔːl/" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Image (Emoji/URL)</label>
                  <input type="text" value={fcImage} onChange={(e) => setFcImage(e.target.value)} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Difficulty</label>
                <select value={fcDifficulty} onChange={(e) => setFcDifficulty(e.target.value as any)} className="input-field">
                  <option value="BEGINNER">BEGINNER</option>
                  <option value="INTERMEDIATE">INTERMEDIATE</option>
                  <option value="ADVANCED">ADVANCED</option>
                </select>
              </div>
              <div className="flex gap-4">
                <button type="submit" disabled={createFlashcardMutation.isPending || updateFlashcardMutation.isPending} className="btn-primary flex-1">
                  {editingFcId ? 'Update Flashcard' : 'Create Flashcard'}
                </button>
                {editingFcId && (
                  <button type="button" onClick={resetFcForm} className="px-6 py-3 rounded-xl bg-slate-200 font-bold hover:bg-slate-300">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="game-card">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Existing Flashcards</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-2">Image</th>
                    <th className="p-2">Word</th>
                    <th className="p-2">Translation</th>
                    <th className="p-2">Difficulty</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {flashcards?.map((fc) => (
                    <tr key={fc.id} className="border-b hover:bg-slate-50">
                      <td className="p-2 text-2xl">
                        {fc.imageUrl?.startsWith('http') ? <img src={fc.imageUrl} alt="" className="w-8 h-8 rounded" /> : fc.imageUrl}
                      </td>
                      <td className="p-2 font-bold text-primary-700">{fc.word}</td>
                      <td className="p-2">{fc.translation}</td>
                      <td className="p-2 text-sm">{fc.difficulty}</td>
                      <td className="p-2 space-x-2">
                        <button onClick={() => handleEditFc(fc)} className="text-blue-600 hover:underline">Edit</button>
                        <button onClick={() => { if(confirm('Are you sure?')) deleteFlashcardMutation.mutate(fc.id); }} className="text-red-600 hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {flashcards?.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-slate-500">No flashcards found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
