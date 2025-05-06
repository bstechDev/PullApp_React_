// import React, { useState } from 'react'
// import { Avatar } from '@mui/material'

// const TestHome = () => {
//   const [posts, setPosts] = useState([
//     {
//       id: 1,
//       author: 'Lori Ferguson',
//       timeAgo: '2h',
//       content: 'Je suis ravi d\'annoncer que j\'ai terminé un cours de certificat d\'études supérieures en gestion de projet avec le tableau d\'honneur du président.',
//       likes: 56,
//       comments: 12,
//       shares: 3
//     }
//   ])

//   return (
//     <div className="max-w-2xl mx-auto p-4">
//       {/* Create Post Section */}
//       <div className="bg-white rounded-lg shadow p-4 mb-6">
//         <div className="flex items-center gap-3">
//           <Avatar className="w-10 h-10" />
//           <input
//             type="text"
//             placeholder="Partagez vos réflexions..."
//             className="bg-gray-100 rounded-full px-4 py-2 w-full"
//           />
//         </div>
//         <div className="flex justify-between mt-4 pt-2 border-t">
//           <button className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg">
//             <span className="material-icons text-green-500">photo</span>
//             Photo
//           </button>
//           <button className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg">
//             <span className="material-icons text-blue-500">videocam</span>
//             Vidéo
//           </button>
//           <button className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg">
//             <span className="material-icons text-red-500">event</span>
//             Événement
//           </button>
//           <button className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg">
//             <span className="material-icons text-yellow-500">mood</span>
//             Sentiment/Activité
//           </button>
//         </div>
//       </div>

//       {/* Posts List */}
//       {posts.map(post => (
//         <div key={post.id} className="bg-white rounded-lg shadow mb-4 p-4">
//           <div className="flex items-center gap-3 mb-4">
//             <Avatar className="w-10 h-10" />
//             <div>
//               <h3 className="font-semibold">{post.author}</h3>
//               <p className="text-gray-500 text-sm">{post.timeAgo}</p>
//             </div>
//           </div>
//           <p className="mb-4">{post.content}</p>
//           <div className="flex justify-between text-gray-500 text-sm border-t pt-3">
//             <button className="flex items-center gap-1">
//               <span className="material-icons text-blue-500">thumb_up</span>
//               {post.likes}
//             </button>
//             <button className="flex items-center gap-1">
//               <span className="material-icons">comment</span>
//               {post.comments} commentaires
//             </button>
//             <button className="flex items-center gap-1">
//               <span className="material-icons">share</span>
//               Partager ({post.shares})
//             </button>
//           </div>
//           <div className="flex items-center gap-3 mt-4 pt-2 border-t">
//             <Avatar className="w-8 h-8" />
//             <input
//               type="text"
//               placeholder="Ajouter un commentaire..."
//               className="bg-gray-100 rounded-full px-4 py-1.5 w-full"
//             />
//           </div>
//         </div>
//       ))}
//     </div>
//   )
// }

// export default TestHome