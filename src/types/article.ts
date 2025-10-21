import { User } from "./user";
import { Category } from "./category";
import { Tag } from "./tag";

export interface Article {
  article_id: bigint;
  title: string;
  content_url: string;
  views?: number;
  user: User;
  category: Category;
  tags?: Tag[];
  createTime?: String;
  updateTime?: String;
}