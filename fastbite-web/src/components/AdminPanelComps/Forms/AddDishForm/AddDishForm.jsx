import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadProductImage, createProduct, fetchCategories, fetchTags } from "../../../../redux/reducers/productSlice";
import "./AddDishForm.css";
import Select from 'react-select';

export const AddDishForm = ({ closeModal }) => {
  const dispatch = useDispatch();
  const productState = useSelector((state) => state.products);

  const categories = productState?.categories || [];
  const tags = productState?.tags || [];
  const status = productState?.status || 'idle';
  const error = productState?.error;

  const [dishName, setDishName] = useState({ default: "", ru: "", az: "" });
  const [dishDescription, setDishDescription] = useState({
    default: "",
    ru: "",
    az: "",
  });
  const [dishPrice, setDishPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [dishImage, setDishImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [openAccordion, setOpenAccordion] = useState("default");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);

  const tagOptions = tags.map(tag => ({
    value: tag.name,
    label: tag.name
  }));

  const customStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: '#fff',
      borderColor: '#ddd',
      '&:hover': {
        borderColor: '#999'
      }
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#e8f0fe',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#1a73e8',
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: '#1a73e8',
      '&:hover': {
        backgroundColor: '#d2e3fc',
        color: '#1a73e8',
      },
    }),
  };

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchTags());
  }, [dispatch]);

  const maxDescriptionLength = 300;

  const handleAccordionToggle = (language) => {
    setOpenAccordion(openAccordion === language ? null : language);
  };

  const handleNameChange = (language, value) => {
    setDishName({ ...dishName, [language]: value });
  };

  const handleDescriptionChange = (language, value) => {
    setDishDescription({ ...dishDescription, [language]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setDishImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submit started');

    if (!selectedCategory) {
      alert("Please select a category");
      return;
    }
    console.log('Category validated');

    if (!dishName.default || !dishName.ru || !dishName.az) {
      alert("Please fill in all name fields");
      return;
    }
    console.log('Names validated');

    if (!dishDescription.default || !dishDescription.ru || !dishDescription.az) {
      alert("Please fill in all description fields");
      return;
    }
    console.log('Descriptions validated');

    if (!dishPrice) {
      alert("Please enter a price");
      return;
    }
    console.log('Price validated');

    if (!imageFile) {
      alert("Please select an image");
      return;
    }
    console.log('Image validated');

    setIsSubmitting(true);
    console.log('IsSubmitting set to true');

    try {
      let imageUrl = '';
      console.log('Starting image upload...');
      if (imageFile) {
        console.log('Uploading file:', imageFile);
        const imageResponse = await dispatch(uploadProductImage(imageFile)).unwrap();
        console.log('Image upload response:', imageResponse);
        imageUrl = imageResponse;
      }

      const translations = [
        {
          languageCode: "en",
          name: dishName.default,
          description: dishDescription.default
        },
        {
          languageCode: "ru",
          name: dishName.ru,
          description: dishDescription.ru
        },
        {
          languageCode: "az",
          name: dishName.az,
          description: dishDescription.az
        }
      ];

      const formattedTags = selectedTags.map(tag => ({
        name: tag.value
      }));

      const productData = {
        id: "00000000-0000-0000-0000-000000000000",
        categoryName: selectedCategory,
        imageUrl: imageUrl,
        price: parseInt(dishPrice),
        translations: translations,
        productTags: formattedTags
      };
      console.log("Sending product data:", productData);

      console.log('Current state before dispatch:', {
        selectedCategory,
        dishPrice,
        imageUrl,
        translations,
        isSubmitting,
        status
      });

      await dispatch(createProduct(productData)).unwrap();
      console.log('Product created successfully');

      closeModal();
      setDishName({ default: "", ru: "", az: "" });
      setDishDescription({ default: "", ru: "", az: "" });
      setDishPrice("");
      setSelectedCategory("");
      setDishImage(null);
      setImageFile(null);
      setSelectedTags([]);

    } catch (err) {
      console.error('Failed to create product:', err);
      alert(err.message || 'Failed to create product');
    } finally {
      setIsSubmitting(false);
      console.log('Submit completed');
    }
  };

  return (
    <form className="adf-form" onSubmit={handleSubmit}>
      <h3>Add New Dish</h3>
      {error && <div className="error-message">{error}</div>}

      <div className="adf-content">
        <div className="adf-left">
          {["default", "ru", "az"].map((language) => (
            <div key={language} className="accordion-section">
              <button
                type="button"
                className="accordion-toggle"
                onClick={() => handleAccordionToggle(language)}
              >
                {language === "default"
                  ? "English"
                  : language === "ru"
                  ? "Russian"
                  : "Azerbaijani"}
              </button>

              {openAccordion === language && (
                <div className="accordion-content">
                  <label>
                    Name ({language === "default" ? "English" : language}):
                    <input
                      type="text"
                      value={dishName[language]}
                      onChange={(e) => handleNameChange(language, e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Description ({language === "default" ? "English" : language}):
                    <input
                      type="text"
                      value={dishDescription[language]}
                      onChange={(e) =>
                        handleDescriptionChange(language, e.target.value)
                      }
                      maxLength={maxDescriptionLength}
                      required
                    />
                    <small className="char-count">
                      {dishDescription[language].length}/{maxDescriptionLength}{" "}
                      characters
                    </small>
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="adf-right">
          <label>
            Category:
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              required
              disabled={isSubmitting}
            >
              <option value="">
                {status === 'loading' ? 'Loading categories...' : 'Select a category'}
              </option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Price:
            <input
              type="number"
              value={dishPrice}
              onChange={(e) => setDishPrice(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </label>

          <label>
            Image:
            <input 
              type="file" 
              onChange={handleImageChange} 
              accept="image/*"
              disabled={isSubmitting}
            />
            {dishImage && (
              <img src={dishImage} alt="Dish" className="dish-image-preview" />
            )}
          </label>

          <label className="tags-label">
            Tags:
            <Select
              isMulti
              options={tagOptions}
              value={selectedTags}
              onChange={setSelectedTags}
              styles={customStyles}
              isDisabled={isSubmitting || status === 'loading'}
              placeholder={status === 'loading' ? 'Loading tags...' : 'Select tags...'}
              className="tags-select"
              closeMenuOnSelect={false}
              noOptionsMessage={() => "No tags available"}
              isLoading={status === 'loading'}
            />
          </label>

          <button 
            type="submit" 
            disabled={isSubmitting || status === 'loading'}
          >
            {isSubmitting ? 'Adding...' : 'Add Dish'}
          </button>
        </div>
      </div>
    </form>
  );
};
