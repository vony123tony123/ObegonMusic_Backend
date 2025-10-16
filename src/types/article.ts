import { User } from "./user";
import { Category } from "./category";
import { Tag } from "./tag";

export interface Article {
  article_id: string;
  title: string;
  content_url: string;
  views: number;
  user_id: string;
  category_id: string;
  user?: User;
  category?: Category;
  tags?: Tag[];
}