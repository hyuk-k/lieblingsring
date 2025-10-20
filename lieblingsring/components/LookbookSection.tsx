export default function LookbookSection() {
  const looks = [
    "/model-black-blouse-necklace-smile-vintage-wall.jpg",
    "/model-black-slip-sitting-bed-smile-wide.jpg",
    "/model-black-dress-stand-smile-vintage-hangers.jpg",
    "/neckline-key-necklace-left-profile-extreme-closeup.jpg",
  ];

  return (
    <>
      <h2 style={{ fontSize: 32, marginBottom: 24 }}>Lookbook</h2>
      <div className="lookbook-grid">
        {looks.map((src, i) => (
          <img key={i} src={src} alt={`Look ${i + 1}`} style={{ borderRadius: 10 }} />
        ))}
      </div>
    </>
  );
}

