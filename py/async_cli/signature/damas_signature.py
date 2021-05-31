# class Signature:
#     """A Signature object represents the overall signature of a function.
#     It stores a Parameter object for each parameter accepted by the
#     function, as well as information specific to the function itself.
#
#     A Signature object has the following public attributes and methods:
#
#     * parameters : OrderedDict
#         An ordered mapping of parameters' names to the corresponding
#         Parameter objects (keyword-only arguments are in the same order
#         as listed in `code.co_varnames`).
#     * return_annotation : object
#         The annotation for the return type of the function if specified.
#         If the function has no annotation for its return type, this
#         attribute is set to `Signature.empty`.
#     * bind(*args, **kwargs) -> BoundArguments
#         Creates a mapping from positional and keyword arguments to
#         parameters.
#     * bind_partial(*args, **kwargs) -> BoundArguments
#         Creates a partial mapping from positional and keyword arguments
#         to parameters (simulating 'functools.partial' behavior.)
#     """
#
#     __slots__ = ('_return_annotation', '_parameters')
#
#     _parameter_cls = Parameter
#     _bound_arguments_cls = BoundArguments
#
#     empty = _empty
#
#     def __init__(self, parameters=None, *, return_annotation=_empty,
#                  __validate_parameters__=True):
#         """Constructs Signature from the given list of Parameter
#         objects and 'return_annotation'.  All arguments are optional.
#         """
#
#         if parameters is None:
#             params = OrderedDict()
#         else:
#             if __validate_parameters__:
#                 params = OrderedDict()
#                 top_kind = _POSITIONAL_ONLY
#                 kind_defaults = False
#
#                 for param in parameters:
#                     kind = param.kind
#                     name = param.name
#
#                     if kind < top_kind:
#                         msg = (
#                             'wrong parameter order: {} parameter before {} '
#                             'parameter'
#                         )
#                         msg = msg.format(top_kind.description,
#                                          kind.description)
#                         raise ValueError(msg)
#                     elif kind > top_kind:
#                         kind_defaults = False
#                         top_kind = kind
#
#                     if kind in (_POSITIONAL_ONLY, _POSITIONAL_OR_KEYWORD):
#                         if param.default is _empty:
#                             if kind_defaults:
#                                 # No default for this parameter, but the
#                                 # previous parameter of the same kind had
#                                 # a default
#                                 msg = 'non-default argument follows default ' \
#                                       'argument'
#                                 raise ValueError(msg)
#                         else:
#                             # There is a default for this parameter.
#                             kind_defaults = True
#
#                     if name in params:
#                         msg = 'duplicate parameter name: {!r}'.format(name)
#                         raise ValueError(msg)
#
#                     params[name] = param
#             else:
#                 params = OrderedDict((param.name, param) for param in parameters)
#
#         self._parameters = types.MappingProxyType(params)
#         self._return_annotation = return_annotation
#
#     @classmethod
#     def from_function(cls, func):
#         """Constructs Signature for the given python function.
#
#         Deprecated since Python 3.5, use `Signature.from_callable()`.
#         """
#
#         warnings.warn("inspect.Signature.from_function() is deprecated since "
#                       "Python 3.5, use Signature.from_callable()",
#                       DeprecationWarning, stacklevel=2)
#         return _signature_from_function(cls, func)
#
#     @classmethod
#     def from_builtin(cls, func):
#         """Constructs Signature for the given builtin function.
#
#         Deprecated since Python 3.5, use `Signature.from_callable()`.
#         """
#
#         warnings.warn("inspect.Signature.from_builtin() is deprecated since "
#                       "Python 3.5, use Signature.from_callable()",
#                       DeprecationWarning, stacklevel=2)
#         return _signature_from_builtin(cls, func)
#
#     @classmethod
#     def from_callable(cls, obj, *, follow_wrapped=True):
#         """Constructs Signature for the given callable object."""
#         return _signature_from_callable(obj, sigcls=cls,
#                                         follow_wrapper_chains=follow_wrapped)
#
#     @property
#     def parameters(self):
#         return self._parameters
#
#     @property
#     def return_annotation(self):
#         return self._return_annotation
#
#     def replace(self, *, parameters=_void, return_annotation=_void):
#         """Creates a customized copy of the Signature.
#         Pass 'parameters' and/or 'return_annotation' arguments
#         to override them in the new copy.
#         """
#
#         if parameters is _void:
#             parameters = self.parameters.values()
#
#         if return_annotation is _void:
#             return_annotation = self._return_annotation
#
#         return type(self)(parameters,
#                           return_annotation=return_annotation)
#
#     def _hash_basis(self):
#         params = tuple(param for param in self.parameters.values()
#                              if param.kind != _KEYWORD_ONLY)
#
#         kwo_params = {param.name: param for param in self.parameters.values()
#                                         if param.kind == _KEYWORD_ONLY}
#
#         return params, kwo_params, self.return_annotation
#
#     def __hash__(self):
#         params, kwo_params, return_annotation = self._hash_basis()
#         kwo_params = frozenset(kwo_params.values())
#         return hash((params, kwo_params, return_annotation))
#
#     def __eq__(self, other):
#         if self is other:
#             return True
#         if not isinstance(other, Signature):
#             return NotImplemented
#         return self._hash_basis() == other._hash_basis()
#
#     def _bind(self, args, kwargs, *, partial=False):
#         """Private method. Don't use directly."""
#
#         arguments = {}
#
#         parameters = iter(self.parameters.values())
#         parameters_ex = ()
#         arg_vals = iter(args)
#
#         while True:
#             # Let's iterate through the positional arguments and corresponding
#             # parameters
#             try:
#                 arg_val = next(arg_vals)
#             except StopIteration:
#                 # No more positional arguments
#                 try:
#                     param = next(parameters)
#                 except StopIteration:
#                     # No more parameters. That's it. Just need to check that
#                     # we have no `kwargs` after this while loop
#                     break
#                 else:
#                     if param.kind == _VAR_POSITIONAL:
#                         # That's OK, just empty *args.  Let's start parsing
#                         # kwargs
#                         break
#                     elif param.name in kwargs:
#                         if param.kind == _POSITIONAL_ONLY:
#                             msg = '{arg!r} parameter is positional only, ' \
#                                   'but was passed as a keyword'
#                             msg = msg.format(arg=param.name)
#                             raise TypeError(msg) from None
#                         parameters_ex = (param,)
#                         break
#                     elif (param.kind == _VAR_KEYWORD or
#                                                 param.default is not _empty):
#                         # That's fine too - we have a default value for this
#                         # parameter.  So, lets start parsing `kwargs`, starting
#                         # with the current parameter
#                         parameters_ex = (param,)
#                         break
#                     else:
#                         # No default, not VAR_KEYWORD, not VAR_POSITIONAL,
#                         # not in `kwargs`
#                         if partial:
#                             parameters_ex = (param,)
#                             break
#                         else:
#                             msg = 'missing a required argument: {arg!r}'
#                             msg = msg.format(arg=param.name)
#                             raise TypeError(msg) from None
#             else:
#                 # We have a positional argument to process
#                 try:
#                     param = next(parameters)
#                 except StopIteration:
#                     raise TypeError('too many positional arguments') from None
#                 else:
#                     if param.kind in (_VAR_KEYWORD, _KEYWORD_ONLY):
#                         # Looks like we have no parameter for this positional
#                         # argument
#                         raise TypeError(
#                             'too many positional arguments') from None
#
#                     if param.kind == _VAR_POSITIONAL:
#                         # We have an '*args'-like argument, let's fill it with
#                         # all positional arguments we have left and move on to
#                         # the next phase
#                         values = [arg_val]
#                         values.extend(arg_vals)
#                         arguments[param.name] = tuple(values)
#                         break
#
#                     if param.name in kwargs and param.kind != _POSITIONAL_ONLY:
#                         raise TypeError(
#                             'multiple values for argument {arg!r}'.format(
#                                 arg=param.name)) from None
#
#                     arguments[param.name] = arg_val
#
#         # Now, we iterate through the remaining parameters to process
#         # keyword arguments
#         kwargs_param = None
#         for param in itertools.chain(parameters_ex, parameters):
#             if param.kind == _VAR_KEYWORD:
#                 # Memorize that we have a '**kwargs'-like parameter
#                 kwargs_param = param
#                 continue
#
#             if param.kind == _VAR_POSITIONAL:
#                 # Named arguments don't refer to '*args'-like parameters.
#                 # We only arrive here if the positional arguments ended
#                 # before reaching the last parameter before *args.
#                 continue
#
#             param_name = param.name
#             try:
#                 arg_val = kwargs.pop(param_name)
#             except KeyError:
#                 # We have no value for this parameter.  It's fine though,
#                 # if it has a default value, or it is an '*args'-like
#                 # parameter, left alone by the processing of positional
#                 # arguments.
#                 if (not partial and param.kind != _VAR_POSITIONAL and
#                                                     param.default is _empty):
#                     raise TypeError('missing a required argument: {arg!r}'. \
#                                     format(arg=param_name)) from None
#
#             else:
#                 if param.kind == _POSITIONAL_ONLY:
#                     # This should never happen in case of a properly built
#                     # Signature object (but let's have this check here
#                     # to ensure correct behaviour just in case)
#                     raise TypeError('{arg!r} parameter is positional only, '
#                                     'but was passed as a keyword'. \
#                                     format(arg=param.name))
#
#                 arguments[param_name] = arg_val
#
#         if kwargs:
#             if kwargs_param is not None:
#                 # Process our '**kwargs'-like parameter
#                 arguments[kwargs_param.name] = kwargs
#             else:
#                 raise TypeError(
#                     'got an unexpected keyword argument {arg!r}'.format(
#                         arg=next(iter(kwargs))))
#
#         return self._bound_arguments_cls(self, arguments)
#
#     def bind(self, /, *args, **kwargs):
#         """Get a BoundArguments object, that maps the passed `args`
#         and `kwargs` to the function's signature.  Raises `TypeError`
#         if the passed arguments can not be bound.
#         """
#         return self._bind(args, kwargs)
#
#     def bind_partial(self, /, *args, **kwargs):
#         """Get a BoundArguments object, that partially maps the
#         passed `args` and `kwargs` to the function's signature.
#         Raises `TypeError` if the passed arguments can not be bound.
#         """
#         return self._bind(args, kwargs, partial=True)
#
#     def __reduce__(self):
#         return (type(self),
#                 (tuple(self._parameters.values()),),
#                 {'_return_annotation': self._return_annotation})
#
#     def __setstate__(self, state):
#         self._return_annotation = state['_return_annotation']
#
#     def __repr__(self):
#         return '<{} {}>'.format(self.__class__.__name__, self)
#
#     def __str__(self):
#         result = []
#         render_pos_only_separator = False
#         render_kw_only_separator = True
#         for param in self.parameters.values():
#             formatted = str(param)
#
#             kind = param.kind
#
#             if kind == _POSITIONAL_ONLY:
#                 render_pos_only_separator = True
#             elif render_pos_only_separator:
#                 # It's not a positional-only parameter, and the flag
#                 # is set to 'True' (there were pos-only params before.)
#                 result.append('/')
#                 render_pos_only_separator = False
#
#             if kind == _VAR_POSITIONAL:
#                 # OK, we have an '*args'-like parameter, so we won't need
#                 # a '*' to separate keyword-only arguments
#                 render_kw_only_separator = False
#             elif kind == _KEYWORD_ONLY and render_kw_only_separator:
#                 # We have a keyword-only parameter to render and we haven't
#                 # rendered an '*args'-like parameter before, so add a '*'
#                 # separator to the parameters list ("foo(arg1, *, arg2)" case)
#                 result.append('*')
#                 # This condition should be only triggered once, so
#                 # reset the flag
#                 render_kw_only_separator = False
#
#             result.append(formatted)
#
#         if render_pos_only_separator:
#             # There were only positional-only parameters, hence the
#             # flag was not reset to 'False'
#             result.append('/')
#
#         rendered = '({})'.format(', '.join(result))
#
#         if self.return_annotation is not _empty:
#             anno = formatannotation(self.return_annotation)
#             rendered += ' -> {}'.format(anno)
#
#         return rendered
