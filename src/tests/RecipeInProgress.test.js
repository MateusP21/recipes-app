import React from 'react';
import { screen, act, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from './helpers/fetchMock';
import renderWithRouterAndContext from './helpers/renderWithRouterAndContext';
import App from '../App';

import { ONE_MEAL_URL, ONE_DRINK_URL, RECIPE_PHOTO, RECIPE_TITLE, RECIPE_TAG,
  RECIPE_INSTRUCTIONS, SHARE_BTN, FAVORITE_BTN, FINISH_RECIPE_BTN }
from './helpers/constants';

const PATH_TO_FOOD = '/foods/52771/in-progress';
const PATH_TO_DRINK = '/drinks/178319/in-progress';

const checkElementsOnScreen = (numOfIngredients) => {
  const recipePhoto = screen.getByTestId(RECIPE_PHOTO);
  const recipeTitle = screen.getByTestId(RECIPE_TITLE);
  const recipeTag = screen.getByTestId(RECIPE_TAG);
  const recipeInstructions = screen.getByTestId(RECIPE_INSTRUCTIONS);

  const recipeIngredients = screen.getAllByRole('checkbox');

  const btnShare = screen.getByTestId(SHARE_BTN);
  const btnFavorite = screen.getByTestId(FAVORITE_BTN);
  const btnFinishRecipe = screen.getByTestId(FINISH_RECIPE_BTN);

  expect(recipePhoto).toBeInTheDocument();
  expect(recipeTitle).toBeInTheDocument();
  expect(recipeTag).toBeInTheDocument();
  expect(recipeInstructions).toBeInTheDocument();
  expect(recipeIngredients).toHaveLength(numOfIngredients);

  expect(btnShare).toBeInTheDocument();
  expect(btnFavorite).toBeInTheDocument();
  expect(btnFinishRecipe).toBeInTheDocument();
};

const testBtnFinishRecipe = () => {
  const ingredientsList = screen.getAllByRole('checkbox', { checked: false });
  const btnFinishRecipe = screen.getByTestId(FINISH_RECIPE_BTN);

  expect(btnFinishRecipe).toBeDisabled();

  ingredientsList.forEach((ingredient) => {
    userEvent.click(ingredient);
  });

  expect(btnFinishRecipe).toBeEnabled();
};

const testRedirectToDoneRecipes = async () => {
  const btnFinishRecipe = screen.getByTestId(FINISH_RECIPE_BTN);
  const ingredientsList = screen.getAllByRole('checkbox', { checked: false });

  ingredientsList.forEach((ingredient) => {
    userEvent.click(ingredient);
  });

  await act(async () => { userEvent.click(btnFinishRecipe); });

  expect(btnFinishRecipe).not.toBeInTheDocument();

  const titleDoneRecipes = screen.getByText(/Done Recipes/i);

  expect(titleDoneRecipes).toBeInTheDocument();
};

beforeEach(() => {
  localStorage.clear();
  jest.spyOn(global, 'fetch').mockImplementation(fetchMock);
});

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

describe('Testa a Tela de Receita em Progresso de uma Comida', () => {
  beforeEach(async () => {
    await act(async () => {
      const { history } = renderWithRouterAndContext(<App />);
      history.push(PATH_TO_FOOD);
    });
  });

  it('Verifica se a requisi????o a API de comidas ?? feita ao carregar a'
  + ' p??gina com o id de uma comida', () => {
    expect(fetch).toHaveBeenCalledWith(ONE_MEAL_URL);
  });

  it('Verifica elementos na tela de receita em progresso de uma comida', () => {
    const numOfIngredients = 8;
    checkElementsOnScreen(numOfIngredients);
  });

  it('Verifica se todos os ingredientes podem ser selecionados', async () => {
    await act(async () => {
      const { history } = renderWithRouterAndContext(<App />);
      history.push(PATH_TO_FOOD);

      const ingredientsList = screen.getAllByRole('checkbox', { checked: false });

      ingredientsList.forEach((ingredient) => {
        userEvent.click(ingredient);
      });

      const numOfIngredients = 8;
      const checkedIngredients = screen.getAllByRole('checkbox', { checked: true });

      expect(checkedIngredients).toHaveLength(numOfIngredients);
    });
  });

  it('Verifica se os ingredientes selecionados ainda est??o com o checkbox'
  + ' marcado depois de recarregar a p??gina', async () => {
    await act(async () => {
      const { history } = renderWithRouterAndContext(<App />);
      history.push(PATH_TO_FOOD);

      const ingredientsList = await screen.getAllByRole('checkbox', { checked: false });

      userEvent.click(ingredientsList[2]);
      userEvent.click(ingredientsList[3]);
      userEvent.click(ingredientsList[5]);
      userEvent.click(ingredientsList[6]);

      history.go(0);

      expect(ingredientsList[0]).not.toBeChecked();
      expect(ingredientsList[1]).not.toBeChecked();
      expect(ingredientsList[2]).toBeChecked();
      expect(ingredientsList[3]).toBeChecked();
      expect(ingredientsList[4]).not.toBeChecked();
      expect(ingredientsList[5]).toBeChecked();
      expect(ingredientsList[6]).toBeChecked();
      expect(ingredientsList[7]).not.toBeChecked();
    });
  });

  it('Verifica se o bot??o de finalizar receita s?? est?? habilitado caso todos '
  + 'os ingrediente forem selecionados', () => {
    testBtnFinishRecipe();
  });

  it('Verifica se ?? redirecionado para a p??gina de receitas feitas, quando o bot??o'
  + 'de finalizar receita ?? clicado', () => {
    testRedirectToDoneRecipes();
  });
});

describe('Testa a Tela de Receita em Progresso de uma Bebida', () => {
  beforeEach(async () => {
    await act(async () => {
      const { history } = renderWithRouterAndContext(<App />);
      history.push(PATH_TO_DRINK);
    });
  });

  it('Verifica se a requisi????o a API de bebidas ?? feita ao carregar a'
  + ' p??gina com o id de uma bebida', () => {
    expect(fetch).toHaveBeenCalledWith(ONE_DRINK_URL);
  });

  it('Verifica elementos na tela de receita em progresso de uma bebida', () => {
    const numOfIngredients = 3;
    checkElementsOnScreen(numOfIngredients);
  });

  it('Verifica se todos os ingredientes podem ser selecionados', async () => {
    const ingredientsList = await screen.getAllByRole('checkbox', { checked: false });

    ingredientsList.forEach((ingredient) => {
      userEvent.click(ingredient);
    });

    const numOfIngredients = 3;
    const checkedIngredients = await screen.getAllByRole('checkbox', { checked: true });

    expect(checkedIngredients).toHaveLength(numOfIngredients);
  });

  it('Verifica se os ingredientes selecionados ainda est??o com o checkbox'
  + ' marcado depois de recarregar a p??gina', async () => {
    await act(async () => {
      const { history } = renderWithRouterAndContext(<App />);
      history.push(PATH_TO_DRINK);

      const ingredientsList = await screen.getAllByRole('checkbox', { checked: false });

      userEvent.click(ingredientsList[0]);
      userEvent.click(ingredientsList[2]);

      history.go(0);

      expect(ingredientsList[0]).toBeChecked();
      expect(ingredientsList[1]).not.toBeChecked();
      expect(ingredientsList[2]).toBeChecked();
    });
  });

  it('Verifica se o bot??o de finalizar receita s?? est?? habilitado caso todos '
  + 'os ingrediente forem selecionados', () => {
    testBtnFinishRecipe();
  });

  it('Verifica se ?? redirecionado para a p??gina de receitas feitas, quando o bot??o'
  + 'de finalizar receita ?? clicado', () => {
    testRedirectToDoneRecipes();
  });
});
