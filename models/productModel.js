import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        p_id: {
            type: Number,
            require: [true, "product id is required"],
            unique: true
        },
        title: {
            type: String,
            require: [true, "Title is required"],
        },
        description: {
            type: String,
            require: [true, "Description is required"],
        },
        pImage: {
            type: String,
            require: [true, "Image is required"],
        },
        images: {
            type: Array,
        },
        slug: {
            type: String,
        },
        metaDescription: {
            type: String,
        },
        metaTitle: {
            type: String,
        },
        metaKeywords: {
            type: String,
        },
        regularPrice: {
            type: Number,
        },
        salePrice: {
            type: Number,
        },
        Status: {
            type: Number,
        },
        stock: {
            type: Number,
        },
        variations: {
            type: Object,
        },
        Category: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category'
        }], // Define Category as an array of ObjectIds
    },
    { timestamps: true }
);

const productModel = mongoose.model("product", productSchema);

export default productModel;
