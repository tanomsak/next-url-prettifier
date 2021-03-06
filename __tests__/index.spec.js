/* @flow */
import UrlPrettifier from 'next-url-prettifier/index';
// Types
import type {RouteType, PrettyUrlPatternType} from 'next-url-prettifier/index';

const patternString: string = '/page-pretty-url-:id';
const prettyUrlPatterns: (PrettyUrlPatternType | string)[] = [
  {pattern: patternString},
  {pattern: '/page-pretty-url-one', defaultParams: {id: 1}}
];
const route: RouteType<*> = {
  page: 'pageName',
  prettyUrl: ({id}: {id: number}): string => `/page-pretty-url-${id}`,
  prettyUrlPatterns
};
const router: UrlPrettifier<*> = new UrlPrettifier([route]);

describe('UrlPrettifier options', (): void => {
  it('should use paramsToQueryString if given', (): void => {
    const routerWithCustomQs: UrlPrettifier<*> = new UrlPrettifier([route], {
      paramsToQueryString: ({id}: {id: number}): string => `/id/${id}`
    });
    expect(routerWithCustomQs.linkPage('pageName', {id: 1}))
      .toEqual({href: '/pageName/id/1', as: '/page-pretty-url-1'});
  });
});

describe('UrlPrettifier linkPage', (): void => {
  it('should return href and as for the route if prettyUrl is a function', (): void => {
    expect(router.linkPage('pageName', {id: 1}))
      .toEqual({href: '/pageName?id=1', as: '/page-pretty-url-1'});
  });

  it('should return href and as for the route if prettyUrl is a string', (): void => {
    const routerWithString: UrlPrettifier<*> = new UrlPrettifier([
      {...route, prettyUrl: '/page-pretty-url-1'}
    ]);
    expect(routerWithString.linkPage('pageName', {id: 1}))
      .toEqual({href: '/pageName?id=1', as: '/page-pretty-url-1'});
  });

  it('should return only href if the route does not exist', (): void => {
    expect(router.linkPage('unknownPage', {id: 1}))
      .toEqual({href: '/unknownPage?id=1'});
  });
});

describe('UrlPrettifier getPrettyUrlPatterns', (): void => {
  it('should return an empty list if prettyUrlPattern type is not allowed', (): void => {
    // $FlowIgnore
    expect(router.getPrettyUrlPatterns({...route, prettyUrlPatterns: {patternString}}))
      .toEqual([]);
  });

  it('should return prettyUrl if its type is string and prettyUrlPattern is undefined', (): void => {
    // eslint-disable-next-line no-unused-vars
    const {prettyUrlPatterns, ...routeWithoutPatterns}: RouteType<*> = route;
    expect(router.getPrettyUrlPatterns({...routeWithoutPatterns, prettyUrl: '/page-pretty-url-1'}))
      .toEqual([{pattern: '/page-pretty-url-1'}]);
  });

  it('should return a PrettyUrlPatternType if prettyUrlPattern is a string', (): void => {
    expect(router.getPrettyUrlPatterns({...route, prettyUrlPatterns: patternString}))
      .toEqual([{pattern: patternString}]);
  });

  it('should return a PrettyUrlPatternType if prettyUrlPattern is an array of string', (): void => {
    expect(router.getPrettyUrlPatterns({...route, prettyUrlPatterns: [patternString]}))
      .toEqual([{pattern: patternString}]);
  });

  it('should return a PrettyUrlPatternType if prettyUrlPattern is rightly typed', (): void => {
    expect(router.getPrettyUrlPatterns({...route, prettyUrlPatterns}))
      .toEqual(prettyUrlPatterns);
  });
});

describe('Router forEachPattern', (): void => {
  it('should iterate on each pattern', (): void => {
    const mockFunction = jest.fn();
    router.forEachPattern(mockFunction);
    expect(mockFunction.mock.calls.length).toBe(2);
    expect(mockFunction).toHaveBeenCalledWith(route.page, patternString, undefined);
    expect(mockFunction).toHaveBeenCalledWith(route.page, '/page-pretty-url-one', {id: 1});
  });
});
