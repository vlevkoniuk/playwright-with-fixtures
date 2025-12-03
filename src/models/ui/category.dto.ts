export interface CategoryDto {
    name: string;
    subcategories: SubcategoryDto[];
}

export interface SubcategoryDto {
    name: string;
}
