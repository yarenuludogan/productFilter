import React, { useState, useEffect, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Scrollbar } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/scrollbar";
import "./HomePage.scss";

function HomePage() {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 1000,
    minPopularity: 0
  });

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        const maxPrice = Math.max(...data.map(p => p.price || 0));
        setFilters(prev => ({ ...prev, maxPrice: Math.ceil(maxPrice) }));
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const price = product.price || 0;
      const popularity = product.popularityScoreOutOf5 || 0;
      
      return price >= filters.minPrice && 
             price <= filters.maxPrice && 
             popularity >= filters.minPopularity;
    });
  }, [products, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  return (
    <div className="homepage-container">
      <h1>Products</h1>

      <div className="filters-container">
        <div className="filter-group">
          <label>Fiyat Aralığı: ${filters.minPrice} - ${filters.maxPrice}</label>
          <div className="price-range">
            <input
              type="range"
              min="0"
              max={filters.maxPrice}
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', parseInt(e.target.value))}
              className="range-slider"
            />
            <input
              type="range"
              min="0"
              max={filters.maxPrice}
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
              className="range-slider"
            />
          </div>
        </div>

        <div className="filter-group">
          <label>Minimum Popülerlik: {filters.minPopularity} ⭐</label>
          <div className="popularity-filter">
            {[0, 1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                className={`star-btn ${filters.minPopularity === rating ? 'active' : ''}`}
                onClick={() => handleFilterChange('minPopularity', rating)}
              >
                {rating} ⭐
              </button>
            ))}
          </div>
        </div>

        <div className="filter-results">
          <span>{filteredProducts.length} ürün bulundu</span>
        </div>
      </div>

      <Swiper
        modules={[Navigation, Scrollbar]}
        navigation
        scrollbar={{ draggable: true }}
        spaceBetween={20}
        slidesPerView={4}
        breakpoints={{
          0: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 4 },
        }}
        className="main-swiper"
      >
        {filteredProducts.map((p) => (
          <SwiperSlide key={p.name}>
            <ProductCard product={p} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

function ProductCard({ product }) {
  const initialColor =
    product?.images && Object.keys(product.images).length > 0
      ? Object.keys(product.images)[0]
      : "yellow";

  const [selectedColor, setSelectedColor] = useState(initialColor);


  if (!product || !product.images) {
    return <div className="product-card">Ürün verisi eksik</div>;
  }

  return (
    <div className="product-card">
      <img
        src={product.images[selectedColor]}
        alt={product.name}
        style={{ width: "100%", borderRadius: "10px" }}
      />
      <h2>{product.name ?? "Unnamed Product"}</h2>
      <p>Price: ${product.price?.toFixed(2) ?? "N/A"}</p>
      <p>Popularity: {product.popularityScoreOutOf5?.toFixed(1) ?? "N/A"} / 5</p>

      <div className="color-options">
        {Object.keys(product.images).map((color) => (
          <span
            key={color}
            className={`color-circle ${color} ${
              selectedColor === color ? "active" : ""
            }`}
            onClick={() => setSelectedColor(color)}
          />
        ))}
      </div>
    </div>
  );
}

export default HomePage;
