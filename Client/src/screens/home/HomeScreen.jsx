import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Hero from "../../components/home/Hero";
import Featured from "../../components/home/Featured";
import NewArrival from "../../components/home/NewArrival";
import SavingZone from "../../components/home/SavingZone";
import Catalog from "../../components/home/Catalog";
import Brands from "../../components/home/Brands";
import Feedback from "../../components/home/Feedback";
import VirtualTryOn from "../VirtualTryOn";

const HomeScreenWrapper = styled.main``;

const HomeScreen = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/products");
        const data = await response.json();
        
        // Shuffle the array to ensure truly mixed and diverse items rather than clumped categories
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        setAllProducts(shuffled);
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <HomeScreenWrapper>
      <Hero />
      {loading ? (
        <div className="flex justify-center items-center py-40">
          <i className="bi bi-arrow-clockwise fa-spin text-5xl" style={{ animation: "spin 1s linear infinite" }}></i>
          <span className="ml-4 text-2xl font-bold text-gray-500">Loading Products...</span>
        </div>
      ) : (
        <>
          <NewArrival products={allProducts.slice(0, 5)} />
          <Catalog catalogTitle={"All Products"} products={allProducts} />
        </>
      )}
      <Brands />
    </HomeScreenWrapper>
  );
};


export default HomeScreen;
