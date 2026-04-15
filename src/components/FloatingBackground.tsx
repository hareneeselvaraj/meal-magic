const FloatingBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-emerald-200/40 blur-3xl animate-blob" />
      <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-orange-200/40 blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-purple-200/30 blur-3xl animate-blob animation-delay-4000" />
      <div className="absolute -bottom-20 right-40 w-64 h-64 rounded-full bg-yellow-200/30 blur-3xl animate-blob animation-delay-6000" />
    </div>
  );
};

export default FloatingBackground;
