if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "C:/Users/Gusta/.gradle/caches/8.10.2/transforms/4f2aef612507aa041478468416130c52/transformed/hermes-android-0.76.5-debug/prefab/modules/libhermes/libs/android.arm64-v8a/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/Gusta/.gradle/caches/8.10.2/transforms/4f2aef612507aa041478468416130c52/transformed/hermes-android-0.76.5-debug/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

