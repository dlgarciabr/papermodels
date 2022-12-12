import { Routes } from "@blitzjs/next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMutation } from "@blitzjs/rpc";
import Layout from "src/core/layouts/Layout";
import createCategory from "src/categories/mutations/createCategory";
import { CategoryForm, FORM_ERROR } from "src/categories/components/CategoryForm";

const NewCategoryPage = () => {
  const router = useRouter();
  const [createCategoryMutation] = useMutation(createCategory);

  return (
    <Layout title={"Create New Category"}>
      <h1>Create New Category</h1>

      <CategoryForm
        submitText="Create Category"
        // TODO use a zod schema for form validation
        //  - Tip: extract mutation's schema into a shared `validations.ts` file and
        //         then import and use it here
        // schema={CreateCategory}
        // initialValues={{}}
        onSubmit={async (values) => {
          try {
            const category = await createCategoryMutation(values);
            await router.push(Routes.ShowCategoryPage({ categoryId: category.id }));
          } catch (error: any) {
            console.error(error);
            return {
              [FORM_ERROR]: error.toString(),
            };
          }
        }}
      />

      <p>
        <Link href={Routes.CategoriesPage()}>
          <a>Categories</a>
        </Link>
      </p>
    </Layout>
  );
};

NewCategoryPage.authenticate = true;

export default NewCategoryPage;
