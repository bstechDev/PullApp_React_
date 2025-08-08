import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { toast } from 'react-toastify';
import { useAuth } from '../../auth/contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';
import ModerationActionModal from '../components/ModerationActionModal';
import ModerationFilters from '../components/ModerationFilters';
import ModerationPostItem from '../components/ModerationPostItem';
import ModerationCommentItem from '../components/ModerationCommentItem';
import { testPostStatus } from '../../Feed/feedService';

const ContentModeration = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: 'pending',
    search: '',
    type: 'all'
  });

  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    action: '',
    contentType: '',
    contentId: null,
    contentPreview: ''
  });

  const loadContent = React.useCallback(async () => {
    try {
      setLoading(true);
      
      const apiParams = {
        page: currentPage
      };
      
      if (filters.search) {
        apiParams.search = filters.search;
      }
      if (filters.status !== 'all') {
        apiParams.status = filters.status;
      }
      if (filters.type !== 'all') {
        apiParams.type = filters.type;
      }

      console.log("🔍 Chargement du contenu avec paramètres:", apiParams);

      let response;
      if (activeTab === 'posts') {
        response = await adminService.getModerationPosts(apiParams);
        if (response.success) {
          console.log("📊 Posts reçus:", response.posts.data);
          console.log("📈 Statistiques des statuts:", {
            pending: response.posts.data.filter(p => p.status === 'pending').length,
            approved: response.posts.data.filter(p => p.status === 'approved').length,
            rejected: response.posts.data.filter(p => p.status === 'rejected').length,
            total: response.posts.data.length
          });
          
          setPosts(response.posts.data);
          setTotalPages(response.posts.last_page);
        }
      } else if (activeTab === 'comments') {
        response = await adminService.getModerationComments(apiParams);
        if (response.success) {
          console.log("📊 Commentaires reçus:", response.comments.data);
          console.log("📈 Statistiques des statuts:", {
            pending: response.comments.data.filter(c => c.status === 'pending').length,
            approved: response.comments.data.filter(c => c.status === 'approved').length,
            rejected: response.comments.data.filter(c => c.status === 'rejected').length,
            total: response.comments.data.length
          });
          
          setComments(response.comments.data);
          setTotalPages(response.comments.last_page);
        }
      }
    } catch (error) {
      toast.error('Erreur lors du chargement du contenu');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, activeTab]);

  useEffect(() => {
    if (user && isAdmin) {
      loadContent();
    }
  }, [currentPage, user, isAdmin, loadContent]);

  useEffect(() => {
    if (user && isAdmin) {
      setCurrentPage(1);
      loadContent();
    }
  }, [filters, user, isAdmin, loadContent]);

  const handlePostAction = async (action, post) => {
    setModalConfig({
      action,
      contentType: 'post',
      contentId: post.id,
      contentPreview: post.content
    });
    setShowModal(true);
  };

  const handleCommentAction = async (action, comment) => {
    setModalConfig({
      action,
      contentType: 'comment',
      contentId: comment.id,
      contentPreview: comment.content
    });
    setShowModal(true);
  };

  const handleModalConfirm = async (contentId, action, reason) => {
    try {
      if (action === 'delete') {
        if (modalConfig.contentType === 'comment') {
          await adminService.deleteComment(contentId);
          toast.success('Commentaire supprimé avec succès');
        } else {
          await adminService.deletePost(contentId);
          toast.success('Post supprimé avec succès');
        }
      } else {
        if (modalConfig.contentType === 'comment') {
          const response = await adminService.moderateComment(contentId, action, reason);
          if (response.success) {
            toast.success(response.message || `Commentaire ${action === 'approve' ? 'approuvé' : 'rejeté'} avec succès`);
          } else {
            throw new Error(response.message || 'Une erreur est survenue');
          }
        } else {
          const response = await adminService.moderatePost(contentId, action, reason);
          if (response.success) {
            toast.success(response.message || `Post ${action === 'approve' ? 'approuvé' : 'rejeté'} avec succès`);
          } else {
            throw new Error(response.message || 'Une erreur est survenue');
          }
        }
      }
      loadContent();
    } catch (error) {
      toast.error(`Erreur lors de l'action: ${error.message}`);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Modération de contenu</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gérez les posts, commentaires et signalements
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={loadContent}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualiser
            </button>
            <button
              onClick={async () => {
                const isPending = await testPostStatus();
                if (isPending) {
                  toast.success("✅ Test réussi : Les posts sont créés avec le statut 'pending'");
                } else {
                  toast.error("❌ Test échoué : Les posts ne sont pas créés avec le statut 'pending'");
                }
                loadContent();
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              🧪 Tester
            </button>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'posts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Posts
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                {posts.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'comments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Commentaires
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                {comments.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Filtres */}
        <div className="p-6">
          <ModerationFilters
            filters={filters}
            setFilters={setFilters}
            posts={activeTab === 'posts' ? posts : comments}
            contentType={activeTab}
          />
        </div>
      </div>

      {/* Contenu selon l'onglet actif */}
      <div>
        {activeTab === 'posts' ? (
          // Liste des posts en grille
          posts.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun post à modérer</h3>
              <p className="mt-1 text-sm text-gray-500">
                Il n'y a actuellement aucun post correspondant à vos critères de recherche.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map(post => (
                <ModerationPostItem
                  key={post.id}
                  post={post}
                  onAction={handlePostAction}
                />
              ))}
            </div>
          )
        ) : (
          // Liste des commentaires en grille
          comments.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun commentaire à modérer</h3>
              <p className="mt-1 text-sm text-gray-500">
                Il n'y a actuellement aucun commentaire correspondant à vos critères de recherche.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {comments.map(comment => (
                <ModerationCommentItem
                  key={comment.id}
                  comment={comment}
                  onAction={handleCommentAction}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Précédent
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Page <span className="font-medium">{currentPage}</span> sur <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Suivant
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modération */}
      <ModerationActionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleModalConfirm}
        action={modalConfig.action}
        contentType={modalConfig.contentType}
        contentId={modalConfig.contentId}
        contentPreview={modalConfig.contentPreview}
      />
    </div>
  );
};

export default ContentModeration;