import React from 'react'

const Navbar = () => {
  return (
    <nav className="bg-blue-900 text-white p-3 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h2 className="text-2xl font-bold">TuDummmm</h2>
        <ul className="flex gap-6">
          <li><a href="#" className="hover:font-bold transition-all">Home</a></li>
          <li><a href="#" className="hover:font-bold transition-all">Tasks</a></li>
          <li><a href="#" className="hover:font-bold transition-all">About</a></li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar